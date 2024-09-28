// This file contains the logic for tlewra.
//
// The network works in the following way:
//
// - Each game needs a single host.
// - The host advertises that it's waiting for clients via advertising its ...-nextid signal.
// - A client reads that then an webrtc offer/answer exchange happens through the signaling server.
// - The host/client communicate via messages.
//
// All network messages are in the form of [cmd][param] where cmd is a one letter code and param can be arbitrary string.
// E.g. "a2" from a client means they are answering "2".
//
// Host->client commands:
//
// - p: Set player statuses and names separated via @.
//      Status w means waiting for answer, a means answered.
//      "paalice@wbob" means 2 players, alice has already answered, but bob's answer is pending.
// - q: Set the current question.
// - x: Host abandoned the game.
//
// Client->host commands:
//
// - n: Set the username of the client. Empty or invalid param resets the client to a follower.
// - j: Jump to specific question. Param is the new card index (1 based).
// - r: Mark the response status.
//      param means a number.
//      0 means no answer at all.
//      +1-4 means the given answer is selected.
//     +16 means the person is the answerer.
//     +32 means the person clicked next question.
// - x: Client leaves.

declare var hAnswererMark: HTMLElement
declare var hCustomDB: HTMLInputElement
declare var hCustomQuestionsReport: HTMLElement
declare var hCustomText: HTMLTextAreaElement
declare var hError: HTMLElement
declare var hFullscreen: HTMLInputElement
declare var hGameUI: HTMLElement
declare var hGameScreen: HTMLElement
declare var hGroupControl: HTMLElement
declare var hHostGame: HTMLInputElement
declare var hHostURL: HTMLElement
declare var hName: HTMLInputElement
declare var hNameErr: HTMLElement
declare var hNetwork: HTMLElement
declare var hNextMark: HTMLElement
declare var hHostcode: HTMLInputElement
declare var hIntro: HTMLElement
declare var hJoincode: HTMLInputElement
declare var hJumpIndex: HTMLInputElement
declare var hNeedJS: HTMLElement
declare var hPlayers: HTMLElement
declare var hPrintable: HTMLElement
declare var hQuestion: HTMLElement
declare var hSeed: HTMLInputElement
declare var hSeedPreview: HTMLElement
declare var hStat: HTMLInputElement

declare var questionsdata: string

// How long keep an answer greyed after the user clicks on it.
const feedbackTimeMS = 300

class client {
  clientID: number
  username: string
  response: number // see the r client->host command
  networkStatus: string
  conn: RTCPeerConnection | null
  channel: RTCDataChannel | null

  constructor(clientID: number, conn: RTCPeerConnection | null, ch: RTCDataChannel | null) {
    this.clientID = clientID
    this.username = ""
    this.response = 0
    this.networkStatus = ""
    this.conn = conn
    this.channel = ch
  }
}

// q[0] is the category, q[1] is the questions, q[2:] are the answers.
type question = string[]

let g = {
  // All questions for each category.
  questions: [] as question[],

  // The questions but shuffled.
  shuffledqs: [] as question[],

  // The currently enabled categories.
  categories: {} as Record<string, boolean>,

  // The current question index from shuffledqs.
  questionIndex: -1 as number,

  // The currently displayed question and its stat.
  currentQuestion: [] as question,
  filteredIndex: -1,
  filteredQuestions: -1,
  currentPos: "", // the "card 12/34" string precomputed

  // To abort a sig request if there's on in flight.
  aborter: null as AbortController | null,

  // All the currently connected clients when hosting.
  // In client mode clients[0] contains the connection to the host.
  // In host mode clients[0] has null connection.
  clients: [] as client[],

  // Just to have insight into what's happening.
  networkStatus: "",

  // Player statuses as described in p host->client message.
  playerStatuses: [] as string[],

  // Whether hosting or just connected to the client.
  // In client mode the client's connection to host is in clients[0].
  clientMode: false as boolean,

  // The fontsize of the question currently show such that it fits the screen.
  fontsize: 0 as number,

  // Time when the user clicked the answer.
  // Used to render short feedback.
  answerTime: 0 as number,
}

function escapehtml(unsafe: string) {
  return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;")
}

let nameRE = /^[\p{Letter}\p{Mark}\p{Number}.-]{1,12}$/u
function validateName(n: string) {
  return nameRE.test(n)
}

function saveCustomQuestions() {
  handleParse()
  if (hCustomText.value == "") {
    localStorage.removeItem("CustomQuestions")
  } else {
    localStorage.setItem("CustomQuestions", hCustomText.value)
  }
}

let saveCustomQuestionsTimeout: number
function handleCustomTextChange() {
  clearTimeout(saveCustomQuestionsTimeout)
  saveCustomQuestionsTimeout = setTimeout(saveCustomQuestions, 1000)
}

// Seedable random from https://stackoverflow.com/a/19301306/103855.
let m_w = 123456789
let m_z = 987654321
let mask = 0xffffffff
function seed(i: number) {
  m_w = (123456789 + i) & mask
  m_z = (987654321 - i) & mask
}
function random() {
  m_z = (36969 * (m_z & 65535) + (m_z >> 16)) & mask
  m_w = (18000 * (m_w & 65535) + (m_w >> 16)) & mask
  let result = ((m_z << 16) + (m_w & 65535)) >>> 0
  result /= 4294967296
  return result
}

function selectQuestions() {
  for (let cat in g.categories) {
    g.categories[cat] = (document.getElementById("hq" + cat[0]) as HTMLInputElement).checked
  }
  let cnt = 0
  for (let q of g.shuffledqs) {
    if (g.categories[q[0]]) cnt++
  }
  g.filteredQuestions = cnt
}

function shuffle() {
  selectQuestions()
  let qs = g.questions.slice()

  // Shuffle the questions.
  let seednumber = parseInt(hSeed.value)
  if (seednumber != 0) {
    seed(seednumber)
    for (let i = qs.length - 1; i > 0; i--) {
      let j = Math.floor(random() * (i + 1))
      ;[qs[i], qs[j]] = [qs[j], qs[i]]
    }
  }
  g.shuffledqs = qs
}

function handleSeedPreview() {
  shuffle()

  let html = ""
  for (let q of g.shuffledqs) {
    if (g.categories[q[0]]) html += `<li>${escapehtml(q.join(" @ "))}\n`
  }
  hSeedPreview.innerHTML = html
  location.hash = "#preview"
}

function makeQuestionHTML(q: question) {
  if (q.length <= 1) {
    return "loading..."
  }
  let answerid = 0
  let a = () => {
    answerid++
    return `id=ha${answerid} onclick=handleGameClick(${answerid})`
  }

  if (q[1].startsWith("vote: ")) {
    let h = `<p>Group vote: ${escapehtml(q[1].slice(6))}</p><br>\n`
    h += `<p ${a()}>1. definitely not</p>\n`
    h += `<p ${a()}>2. can be talked into it</p>\n`
    h += `<p ${a()}>3. I don't mind trying</p>\n`
    h += `<p ${a()}>4. definitely yes</p>\n`
    return h
  }
  if (q[1].startsWith("dare: ")) {
    let qt = q[1].slice(6).replaceAll("X", "[answerer]")
    let h = `<p>Dare: ${escapehtml(qt)}</p><br>\n`
    h += `<p ${a()}>1. no</p>\n`
    h += `<p ${a()}>2. can be talked into it</p>\n`
    h += `<p ${a()}>3. I don't mind trying</p>\n`
    h += `<p ${a()}>4. yes</p>\n`
    return h
  }
  let h = `<p>${escapehtml(q[1])}</p><br>`
  for (let i = 2; i < q.length; i++) h += `<p ${a()}>${i - 1}. ${escapehtml(q[i])}</p>\n`
  return h
}

function handlePrint() {
  selectQuestions()

  let h = ""
  for (let q of g.questions) {
    if (g.categories[q[0]]) h += `<div class=hPrintableCard><span>${makeQuestionHTML(q)}</span></div>`
  }
  hPrintable.hidden = false
  hPrintable.innerHTML = h
  for (let div of hPrintable.children) {
    let span = div.children[0] as HTMLElement
    let [lo, hi] = [50, 200]
    for (let i = 0; i < 4; i++) {
      let mid = (lo + hi) / 2
      span.style.fontSize = `${mid}%`
      if (div.scrollWidth <= div.clientWidth && div.scrollHeight <= div.clientHeight) {
        lo = mid
      } else {
        hi = mid
      }
    }
    span.style.fontSize = `${lo}%`
  }

  location.hash = "#printable"
}

function handleStart() {
  g.clients = [new client(-1, null, null)]
  handleNameChange(hName.value)
  selectQuestions()
  g.questionIndex = -1
  g.filteredIndex = -1
  handleNext()
  handleHost()
}

function handlePrev() {
  if (g.filteredIndex == 0) return
  if (g.clientMode) {
    if (g.clients.length >= 1) g.clients[0].channel?.send(`j${g.filteredIndex}`)
    return
  }
  g.filteredIndex--
  g.questionIndex--
  while (g.questionIndex > 0 && !g.categories[g.shuffledqs[g.questionIndex][0]]) g.questionIndex--
  g.currentQuestion = g.shuffledqs[g.questionIndex]
  g.currentPos = `card ${g.filteredIndex + 1}/${g.filteredQuestions}`
  updateCurrentQuestion()
  renderQuestion(rendermode.full)
}

function handleNext() {
  if (g.filteredIndex == g.filteredQuestions) return
  if (g.clientMode) {
    if (g.clients.length >= 1) g.clients[0].channel?.send(`j${g.filteredIndex + 2}`)
    return
  }
  g.filteredIndex++
  g.questionIndex++
  while (g.questionIndex < g.shuffledqs.length && !g.categories[g.shuffledqs[g.questionIndex][0]]) g.questionIndex++
  updateCurrentQuestion()
  renderQuestion(rendermode.full)
}

function handleGameClick(v: number) {
  if (1 <= v && v <= 9) {
    // Clear previous highlight if there was one.
    let elem = document.getElementById(`ha${g.clients[0].response & 15}`)
    if (elem != null) elem.className = ""

    elem = document.getElementById(`ha${v}`)
    if (elem == null) return
    elem.className = "cfgNeutral"
    g.clients[0].response = (g.clients[0].response & ~15) | v
    g.answerTime = Date.now()
    if (g.clientMode) g.clients[0].channel?.send(`r${g.clients[0].response}`)
    setTimeout(() => renderQuestion(rendermode.quick), feedbackTimeMS + 1)
  }
}

function updateCurrentQuestion() {
  if (g.questionIndex == g.shuffledqs.length) {
    g.currentQuestion = ["none", "Game over because out of questions. What now?", "go home", "play again with spicier categories", "play something else"]
  } else {
    g.currentQuestion = g.shuffledqs[g.questionIndex]
  }
  g.currentPos = `card ${g.filteredIndex + 1}/${g.filteredQuestions}`
  for (let c of g.clients) c.channel?.send("q" + [`${g.filteredIndex}`, `${g.filteredQuestions}`].concat(g.currentQuestion).join("@"))
}

function isEqualArray<T>(a: T[], b: T[]) {
  if (a.length != b.length) return false
  return a.every((v, i) => b[i] == v)
}

function updatePlayerStatus() {
  if (g.clientMode) return
  let status = []
  for (let c of g.clients) {
    if (c.networkStatus == "" && c.username != "") {
      let st = "w"
      if (c.response != 0) st = "a"
      status.push(st + c.username)
    }
  }
  status.sort((a, b) => {
    if (a < b) return -1
    if (a > b) return +1
    return 0
  })
  if (!isEqualArray(g.playerStatuses, status)) {
    g.playerStatuses = status
    let msg = "p" + status.join("@")
    for (let c of g.clients) c.channel?.send(msg)
  }
}

function renderStatus() {
  let stat = `${g.currentPos}, category ${g.currentQuestion[0]}`
  if (!g.clientMode) {
    let [players, followers, pending] = [0, 0, 0]
    for (let c of g.clients) {
      if (c.networkStatus != "" && c.conn != null) pending++
      if (c.networkStatus == "" && c.username == "") followers++
      if (c.networkStatus == "" && c.username != "") {
        players++
      }
    }
    if (g.clients.length >= 2) {
      if (g.clients[0].username == "") followers--
      if (followers > 0) stat += `, ${followers} followers`
      if (players > 0) stat += `, ${players} players`
      if (pending > 0) stat += `, ${pending} pending`
    }
  }
  hStat.innerText = stat

  let h = ""
  for (let ps of g.playerStatuses) {
    if (h != "") h += ", "
    h += ps.slice(1)
  }
  hPlayers.innerHTML = "Players: " + h
}

enum rendermode {
  quick,
  full,
}

function renderQuestion(mode: rendermode) {
  renderStatus()

  if (mode == rendermode.full) {
    let h = ""
    h += "<button onclick=handlePrev() style=width:45%>Prev</button> <button onclick=handleNext() style=width:45%>Next</button>\n"
    h += makeQuestionHTML(g.currentQuestion)
    hQuestion.innerHTML = h
    g.fontsize = 300
    hGameScreen.style.fontSize = `300px`

    // Update player count based parts of the interface.
    let playercnt = g.playerStatuses.length
    if (playercnt <= 1) {
      hGroupControl.hidden = true
      hPlayers.hidden = true
    } else if (playercnt == 2) {
      hGroupControl.hidden = true
      hPlayers.hidden = false
    } else {
      hGroupControl.hidden = false
      hPlayers.hidden = false
    }
  }

  // Highlight player response for a short moment if needed.
  if (g.clients[0].response != 0) {
    let elem = document.getElementById(`ha${g.clients[0].response & 15}`)
    if (elem != null) {
      elem.className = Date.now() - g.answerTime < feedbackTimeMS ? "cfgNeutral" : ""
    }
  }
  if (Date.now() - g.answerTime >= feedbackTimeMS) {
    document.body.className = (g.clients[0].response & 15) == 0 ? "" : "cbgNotice"
  }

  // Shrink to fit.
  while (g.fontsize >= 12 && (hGameUI.scrollWidth + hGameUI.offsetLeft > innerWidth || hGameUI.scrollHeight + hGameUI.offsetTop > innerHeight)) {
    g.fontsize = Math.floor(0.9 * g.fontsize)
    hGameScreen.style.fontSize = `${g.fontsize}px`
  }
}

function disconnectAll() {
  g.aborter?.abort()
  g.clientMode = false
  for (let c of g.clients) {
    if (c.conn != null) {
      if (c.channel != null) {
        c.channel.onmessage = null
        c.channel.send("x")
        c.channel = null
      }
      c.conn.oniceconnectionstatechange = null
      c.conn.close()
      c.conn = null
    }
  }
  g.clients = []
}

function handleHash() {
  hIntro.hidden = true
  hSeedPreview.hidden = true
  hPrintable.hidden = true
  hGameUI.hidden = true

  // Close all connections.
  disconnectAll()

  if (location.hash == "#preview") {
    handleSeedPreview()
    hSeedPreview.hidden = false
    return
  }
  if (location.hash == "#printable") {
    handlePrint()
    hPrintable.hidden = false
    return
  }
  if (location.hash == "#play") {
    handleStart()
    hGameUI.hidden = false
    renderQuestion(rendermode.full)
    return
  }
  if (location.hash.startsWith("#join-")) {
    hGameUI.hidden = false
    join()
    return
  }

  hIntro.hidden = false
}

function handleAnswererMarkClick() {
  if (hAnswererMark.innerText == "[x]") {
    hAnswererMark.innerText = "[ ]"
    document.body.className = ""
  } else {
    hAnswererMark.innerText = "[x]"
    document.body.className = "cbgReference"
  }
}

function handleNextMarkClick() {
  if (hNextMark.innerText == "[x]") {
    hNextMark.innerText = "[ ]"
  } else {
    hNextMark.innerText = "[x]"
  }
}

function handleFullscreen() {
  // Ignore errors, we don't care.
  if (hFullscreen.checked) {
    document.documentElement.requestFullscreen().catch(() => {})
  } else {
    document.exitFullscreen().catch(() => {})
  }
  renderQuestion(rendermode.full)
}

function handleJump(v: string) {
  let [idx, total] = [parseInt(v), 0]
  if (idx <= 0 || idx > g.filteredQuestions + 1) return
  if (g.clientMode) {
    if (g.clients.length >= 1) g.clients[0].channel?.send(`j${idx}`)
    return
  }
  g.questionIndex = g.shuffledqs.length
  g.filteredIndex = g.filteredQuestions
  for (let i = 0; i < g.shuffledqs.length; i++) {
    if (!g.categories[g.shuffledqs[i][0]]) continue
    total++
    if (total == idx) {
      g.filteredIndex = total - 1
      g.questionIndex = i
      break
    }
  }
  updateCurrentQuestion()
  renderQuestion(rendermode.full)
}

// Parses data into g.questionsDB.
// Returns an error message if there were errors, an empty string otherwise.
function handleParse() {
  let data = questionsdata
  if (hCustomDB.checked) data = hCustomText.value
  let category = "unset-category"
  let invalidCategories = new Set()
  let badcards = 0
  let badcard = ""
  let badreason = ""
  let qs = []
  let knownCategories = new Set()
  for (let cat in g.categories) knownCategories.add(cat)
  for (let line of data.split("\n")) {
    let hashidx = line.indexOf("#")
    if (hashidx != -1) line = line.slice(0, hashidx)
    line = line.trim()
    if (line == "") continue
    if (line.startsWith("@")) {
      category = line.substr(1)
      if (!knownCategories.has(category)) invalidCategories.add(category)
      continue
    }
    let parts = line.split("@")
    for (let i in parts) parts[i] = parts[i].trim()
    let special = parts[0].startsWith("dare: ") || parts[0].startsWith("vote: ")
    let x = parts[0].indexOf("X")
    if (!knownCategories.has(category)) {
      badcards++
      badcard = line
      badreason = "invalid category"
    } else if (special && parts.length != 1) {
      badcards++
      badcard = line
      badreason = "needs no answers"
    } else if (!special && !(2 <= parts.length - 1 && parts.length - 1 <= 4)) {
      badcards++
      badcard = line
      badreason = `got ${parts.length - 1} answers, want 2-4`
    } else if (parts[0].startsWith("dare: ") && (x == -1 || parts[0].lastIndexOf("X") != x)) {
      badcards++
      badcard = line
      badreason = "needs exactly one 1 X"
    } else {
      qs.push([category].concat(parts))
    }
  }
  g.questions = qs
  shuffle()

  let err = ""
  if (invalidCategories.size > 0) {
    err = `found invalid categories: ${Array.from(invalidCategories.values()).join(", ")}`
  } else if (badcards > 0) {
    err = `found ${badcards} bad cards, last one is "${badcard}", reason: ${badreason}`
  }

  if (!hCustomDB.checked) {
    hCustomQuestionsReport.innerText = ""
    if (err != "") seterror(err)
  } else {
    if (err != "") {
      hCustomQuestionsReport.innerText = `Error: ${err}.`
    } else {
      hCustomQuestionsReport.innerText = `Found ${qs.length} entries.`
    }
  }
}

// Convert continuation passing style into direct style:
// await eventPromise(obj, 'click') will wait for a single click on obj.
function eventPromise(obj: EventTarget, eventName: string) {
  return new Promise((resolve) => {
    let handler = (event: Event) => {
      obj.removeEventListener(eventName, handler)
      resolve(event)
    }
    obj.addEventListener(eventName, handler)
  })
}

function handleNameChange(s: string) {
  if (s != "" && !validateName(s)) {
    hName.className = "cbgNegative"
    hNameErr.innerText = "invalid name, must be at most 12 alphanumeric characters"
    s = ""
  } else {
    hName.className = ""
    hNameErr.innerText = ""
  }
  localStorage.setItem("Username", s)
  if (g.clientMode) {
    if (g.clients.length >= 0) g.clients[0].channel?.send("n" + s)
    return
  }
  g.clients[0].username = s
  updatePlayerStatus()
  renderStatus()
}

const signalingServer = "https://iio.ie/sig"
const rtcConfig = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] }

function renderNetworkStatus() {
  if (g.clientMode) {
    hNetwork.hidden = false
    if (g.networkStatus != "") {
      hNetwork.innerText = "Network status: " + g.networkStatus
    } else {
      hNetwork.innerText = "Network status: connected"
    }
    return
  }

  let parts = []
  if (g.networkStatus != "") parts.push(g.networkStatus)
  for (let c of g.clients) {
    if (c.networkStatus != "") parts.push(`client ${c.clientID}: ${c.networkStatus}`)
  }
  if (parts.length != 0) {
    hNetwork.hidden = false
    hNetwork.innerText = "Network status: " + parts.join("; ")
  } else {
    hNetwork.hidden = true
  }
  renderStatus()
}

function setNetworkStatus(s: string) {
  g.networkStatus = s
  renderNetworkStatus()
}

async function connectToClient(hostcode: string, clientID: number) {
  // Create a description offer and upload it to the signaling service.
  let response
  let conn = new RTCPeerConnection(rtcConfig)
  let channel = conn.createDataChannel("datachannel")
  let c = new client(clientID, conn, null)

  g.clients.push(c)
  let updateStatus = (msg: string) => {
    c.networkStatus = msg
    renderNetworkStatus()
  }
  let error = async (msg: string) => {
    updateStatus(msg)
    conn.oniceconnectionstatechange = null
    channel.onmessage = null
    conn.close()
    c.conn = null
    c.channel = null
    renderStatus()
    await new Promise((resolve) => setTimeout(resolve, 5000))
    g.clients.splice(g.clients.indexOf(c), 1)
    renderNetworkStatus()
  }

  conn.oniceconnectionstatechange = async (ev) => {
    if (conn.iceConnectionState != "disconnected") return
    error(`error: lost connection to ${c.username == "" ? "a follower" : c.username}`)
  }
  channel.onmessage = async (ev) => {
    let msg = (ev as MessageEvent).data
    if (msg.length == 0) return
    let param = msg.substr(1)
    switch (msg[0]) {
      case "j":
        handleJump(param)
        break
      case "r":
        let r = parseInt(param)
        if (r != r) break
        c.response = r
        updatePlayerStatus()
        renderQuestion(rendermode.quick)
        break
      case "n":
        if (!validateName(param)) param = ""
        c.username = param
        updatePlayerStatus()
        renderQuestion(rendermode.full)
        break
      case "x":
        error(`${c.username == "" ? "a follower" : c.username} exited`)
        updatePlayerStatus()
        renderQuestion(rendermode.full)
        break
      default:
        console.log("Unhandled message:", msg)
        break
    }
  }

  updateStatus("creating local offer")
  let offer = await conn.createOffer()
  conn.setLocalDescription(offer)
  updateStatus("awaiting iceGatherState completion")
  do {
    await eventPromise(conn, "icegatheringstatechange")
  } while (conn.iceGatheringState != "complete")
  updateStatus("uploading offer")
  try {
    response = await fetch(`${signalingServer}?set=tlewra-${hostcode}-${clientID}-offer&timeoutms=5000`, {
      method: "POST",
      body: conn.localDescription?.sdp,
    })
  } catch (e) {
    error(`error: upload offer: ${e} (client has to try again)`)
    return
  }
  if (response.status != 200) {
    error("error: ${response.status}: client didn't read offer")
    return
  }

  // Establish the connection to the connecting client.
  updateStatus("awaiting client's answer")
  try {
    response = await fetch(`${signalingServer}?get=tlewra-${hostcode}-${clientID}-answer&timeoutms=5000`, { method: "POST" })
  } catch (e) {
    error(`error: await client's answer: ${e} (client has to try again)`)
    return
  }
  if (response.status != 200) {
    error(`error: ${response.status}: client didn't answer (client has to try again)`)
    return
  }
  let sdp = await response.text()
  conn.setRemoteDescription({ type: "answer", sdp: sdp })
  updateStatus("establishing connection")
  await eventPromise(channel, "open")
  c.channel = channel
  updateStatus("")
  channel.send("q" + [`${g.filteredIndex}`, `${g.filteredQuestions}`].concat(g.currentQuestion).join("@"))
}

async function handleHost() {
  if (!hHostGame.checked) {
    g.aborter?.abort()
    setNetworkStatus("")
    hHostcode.disabled = false
    hHostURL.hidden = true
    return
  }

  let hostcode = hHostcode.value
  localStorage.setItem("Hostcode", hHostcode.value)

  let href = location.origin + location.pathname + `#join-${hostcode}`
  hHostcode.disabled = true
  hHostURL.innerHTML = `<br>join link: <a href='${href}'>${href}</a>`
  hHostURL.hidden = false

  setNetworkStatus("initializing")
  g.aborter = new AbortController()

  for (let clientID = 1; ; clientID++) {
    if (g.aborter.signal.aborted) {
      return
    }
    let response
    // Advertise the next client ID.
    setNetworkStatus("waiting for next client")
    try {
      response = await fetch(`${signalingServer}?set=tlewra-${hostcode}-nextid`, {
        method: "POST",
        body: `${clientID}`,
        signal: g.aborter.signal,
      })
    } catch (e) {
      if (g.aborter.signal.aborted) {
        return
      }
      setNetworkStatus(`error: upload offer to signaling server: ${e} (will try again soon)`)
      await new Promise((resolve) => setTimeout(resolve, 5000 + Math.random() * 10))
      continue
    }
    if (response.status == 409) {
      setNetworkStatus(`error: code already taken by another server (will try again soon though)`)
      await new Promise((resolve) => setTimeout(resolve, 5000 + Math.random() * 10))
      continue
    }
    if (response.status == 204) {
      continue
    }
    if (response.status != 200) {
      let body = await response.text()
      setNetworkStatus(`error: upload offer to signaling server: ${response.status}: ${body} (will try again soon)`)
      await new Promise((resolve) => setTimeout(resolve, 5000 + Math.random() * 10))
      continue
    }
    let id = clientID
    setTimeout(() => {
      connectToClient(hostcode, id)
    }, 0)
  }
}

function handleJoin() {
  if (hJoincode.value == "" || hJoincode.value.startsWith("-")) return
  location.hash = "#join-" + hJoincode.value
}

async function join() {
  let joincode = location.hash.substr(6)
  localStorage.setItem("Joincode", joincode)

  g.clientMode = true
  g.aborter = new AbortController()
  while (true) {
    let response
    setNetworkStatus("awaiting server's signal")
    try {
      response = await fetch(`${signalingServer}?get=tlewra-${joincode}-nextid&timeoutms=600000`, { method: "POST" })
    } catch (e) {
      setNetworkStatus(`error: await server's signal: ${e} (will try again soon`)
      await new Promise((resolve) => setTimeout(resolve, 5000 + Math.random() * 10))
      continue
    }
    if (response.status == 204) {
      continue
    }
    if (response.status != 200) {
      let body = await response.text()
      setNetworkStatus(`error: wait server's signal: ${body} (will try again soon)`)
      await new Promise((resolve) => setTimeout(resolve, 5000 + Math.random() * 10))
      continue
    }
    let clientID = await response.text()

    setNetworkStatus("awaiting server's offer")
    try {
      response = await fetch(`${signalingServer}?get=tlewra-${joincode}-${clientID}-offer&timeoutms=5000`, { method: "POST" })
    } catch (e) {
      setNetworkStatus(`error: wait server's offer: ${e} (will try again soon`)
      await new Promise((resolve) => setTimeout(resolve, 5000 + Math.random() * 10))
      continue
    }
    if (response.status != 200) {
      let body = await response.text()
      setNetworkStatus(`error: wait server's offer: ${response.status}: ${body} (will try again soon)`)
      await new Promise((resolve) => setTimeout(resolve, 5000 + Math.random() * 10))
      continue
    }
    let offer = await response.text()
    let conn = new RTCPeerConnection(rtcConfig)

    conn.oniceconnectionstatechange = async (ev) => {
      if (conn.iceConnectionState != "disconnected") return
      conn.oniceconnectionstatechange = null
      conn.close()
      g.clients = []
      setNetworkStatus("error: lost connection (will try reconnecting soon)")
      await new Promise((resolve) => setTimeout(resolve, 5000 + Math.random() * 10))
      join()
    }

    conn.ondatachannel = (ev) => {
      let channel = (ev as RTCDataChannelEvent).channel
      if (g.aborter?.signal.aborted) {
        channel.send("x")
        conn.close()
        return
      }
      g.clients = [new client(0, conn, channel)]
      handleNameChange(hName.value)
      channel.onmessage = async (ev) => {
        let msg = (ev as MessageEvent).data
        if (msg.length == 0) return
        let [cmd, param] = [msg[0], msg.slice(1)]
        switch (cmd) {
          case "p":
            g.playerStatuses = param.split("@")
            renderQuestion(rendermode.full)
            return
          case "q":
            let parts = param.split("@")
            if (parts.length <= 3) return
            ;[g.filteredIndex, g.filteredQuestions] = [parseInt(parts[0]), parseInt(parts[1])]
            g.currentPos = `card ${g.filteredIndex + 1}/${g.filteredQuestions}`
            g.currentQuestion = parts.slice(2)
            renderQuestion(rendermode.full)
            return
          case "x":
            conn.oniceconnectionstatechange = null
            channel.onmessage = null
            conn.close()
            g.clients = []
            setNetworkStatus("error: host abandoned the game (will try reconnecting soon)")
            await new Promise((resolve) => setTimeout(resolve, 5000 + Math.random() * 10))
            join()
            return
          default:
            console.log("Unhandled message:", msg)
            break
        }
      }
    }

    setNetworkStatus("awaiting iceGatherState completion")
    await conn.setRemoteDescription({ type: "offer", sdp: offer })
    conn.setLocalDescription(await conn.createAnswer())
    do {
      await eventPromise(conn, "icegatheringstatechange")
    } while (conn.iceGatheringState != "complete")

    setNetworkStatus("sending answer")
    try {
      response = await fetch(`${signalingServer}?set=tlewra-${joincode}-${clientID}-answer`, {
        method: "POST",
        body: conn.localDescription?.sdp,
      })
    } catch (e) {
      setNetworkStatus("error: send answer: ${e} (will try again soon)")
      await new Promise((resolve) => setTimeout(resolve, 5000 + Math.random() * 10))
      continue
    }
    if (response.status != 200) {
      let body = await response.text()
      setNetworkStatus(`error: send answer: ${response.status}: ${body} (will try again soon)`)
      await new Promise((resolve) => setTimeout(resolve, 5000 + Math.random() * 10))
      continue
    }
    break
  }
  setNetworkStatus("")
}

function seterror(msg: string) {
  hError.innerText = `Error: ${msg}.\nReload the page to try again.`
  hError.hidden = false
  document.body.classList.add("cbgNeutral")
}

function main() {
  hNeedJS.hidden = true
  window.onerror = (msg, src, line) => seterror(`${src}:${line} ${msg}`)
  window.onunhandledrejection = (e) => seterror(e.reason)
  window.onhashchange = handleHash
  window.onbeforeunload = disconnectAll
  window.onresize = () => {
    if (location.hash == "#play" || location.hash.startsWith("#join-")) renderQuestion(rendermode.full)
  }

  // Init category names.
  for (let cat of ["softball", "divisive", "intimate", "partner", "light-dares", "hot-dares", "activities", "naughty-activities"]) {
    g.categories[cat] = false
  }

  // Init seed with current day.
  let now = new Date()
  hSeed.value = `${(now.getMonth() + 1) * 100 + now.getDate()}`

  // Load custom questions from localstorage if there are some.
  let storedQuestions = localStorage.getItem("CustomQuestions")
  if (storedQuestions != null) hCustomText.value = storedQuestions

  // Load or generate host code.
  let storedHostcode = localStorage.getItem("Hostcode")
  if (storedHostcode == null && hHostcode.value == "") {
    let hostcode = Math.round(1000 + Math.random() * (9999 - 1000))
    hHostcode.value = `${hostcode}`
  } else if (storedHostcode != null) {
    hHostcode.value = storedHostcode
  }

  // Load join code if stored.
  let storedJoincode = localStorage.getItem("Joincode")
  if (storedJoincode != null && hJoincode.value == "") {
    hJoincode.value = storedJoincode
  }

  // Load name if stored.
  let storedName = localStorage.getItem("Username")
  if (storedName != null && hName.value == "") {
    hName.value = storedName
  }

  handleParse()
  handleHash()
}

main()
