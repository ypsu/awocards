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
// - q: Set the current question.
//
// Client->host commands:
//
// - n: Set the username of the client. Empty param resets the client to a follower.

declare var hCustomDB: HTMLInputElement
declare var hCustomQuestionsReport: HTMLElement
declare var hCustomText: HTMLTextAreaElement
declare var hError: HTMLElement
declare var hFullscreen: HTMLInputElement
declare var hGameUI: HTMLElement
declare var hGameScreen: HTMLElement
declare var hHostGame: HTMLInputElement
declare var hHostURL: HTMLElement
declare var hNetwork: HTMLElement
declare var hHostcode: HTMLInputElement
declare var hIntro: HTMLElement
declare var hJoincode: HTMLInputElement
declare var hJumpIndex: HTMLInputElement
declare var hNeedJS: HTMLElement
declare var hPrintable: HTMLElement
declare var hSeed: HTMLInputElement
declare var hSeedPreview: HTMLElement
declare var hStat: HTMLInputElement

declare var hqPersonal: HTMLInputElement
declare var hqDivisive: HTMLInputElement
declare var hqSpicy: HTMLInputElement
declare var hqPartner: HTMLInputElement
declare var hqDaresLight: HTMLInputElement
declare var hqDaresSpicy: HTMLInputElement

declare var questionsdata: string

class client {
  clientID: number
  username: string
  networkStatus: string
  conn: RTCPeerConnection
  channel: RTCDataChannel

  constructor(clientID: number, conn: RTCPeerConnection, ch: RTCDataChannel) {
    this.clientID = clientID
    this.username = ""
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
  clients: [] as client[],

  // Just to have insight into what's happening.
  networkStatus: "",

  // Clients only: connection data towards the host.
  clientMode: false as boolean,
  conn: null as RTCPeerConnection | null,
  channel: null as RTCDataChannel | null,
}

function escapehtml(unsafe: string) {
  return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;")
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
  let cats = {} as Record<string, boolean>
  if (hqPersonal.checked) cats["personal"] = true
  if (hqDivisive.checked) cats["divisive"] = true
  if (hqSpicy.checked) cats["spicy"] = true
  if (hqPartner.checked) cats["partner"] = true
  if (hqDaresLight.checked) cats["dares-light"] = true
  if (hqDaresSpicy.checked) cats["dares-spicy"] = true
  let cnt = 0
  for (let q of g.shuffledqs) {
    if (cats[q[0]]) cnt++
  }
  g.categories = cats
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
  let h = `<p>${escapehtml(q[1])}</p>\n<ol>\n`
  if (q.length == 2) {
    h += "<li>no<li>yes</ol>\n"
    h += "<p>Others: would you want to do that to the answerer?</p>\n"
    h += "<ol><li>no<li>I can<li>I want to</ol>\n"
    return h
  }
  for (let i = 2; i < q.length; i++) h += `<li>${escapehtml(q[i])}\n`
  h += "</ol>\n"
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
  selectQuestions()
  g.questionIndex = -1
  g.filteredIndex = -1
  handleNext()
  location.hash = "#play"
}

function sendQuestion() {
  let msg = "q" + [`card ${g.filteredIndex + 1}/${g.filteredQuestions}`].concat(g.currentQuestion).join("@")
  for (let c of g.clients) {
    if (c.networkStatus == "") c.channel.send(msg)
  }
}

function handlePrev() {
  if (g.filteredIndex == 0) return
  g.filteredIndex--
  g.questionIndex--
  while (g.questionIndex > 0 && !g.categories[g.shuffledqs[g.questionIndex][0]]) g.questionIndex--
  g.currentQuestion = g.shuffledqs[g.questionIndex]
  g.currentPos = `card ${g.filteredIndex + 1}/${g.filteredQuestions}`
  renderQuestion()
  sendQuestion()
}

function handleNext() {
  if (g.filteredIndex == g.filteredQuestions) return
  g.filteredIndex++
  g.questionIndex++
  while (g.questionIndex < g.shuffledqs.length && !g.categories[g.shuffledqs[g.questionIndex][0]]) g.questionIndex++
  if (g.questionIndex == g.shuffledqs.length) {
    g.currentQuestion = ["none", "Game over because out of questions. What now?", "go home", "play again with spicier categories", "play something else"]
  } else {
    g.currentQuestion = g.shuffledqs[g.questionIndex]
  }
  g.currentPos = `card ${g.filteredIndex + 1}/${g.filteredQuestions}`
  renderQuestion()
  sendQuestion()
}

function renderStatus() {
  let stat = `${g.currentPos}, category ${g.currentQuestion[0]}`
  if (g.clients.length > 0) {
    let [players, followers, pending] = [0, 0, 0]
    for (let c of g.clients) {
      if (c.networkStatus != "") pending++
      if (c.networkStatus == "" && c.username == "") followers++
      if (c.networkStatus == "" && c.username != "") players++
    }
    if (followers > 0) stat += `, ${followers} followers`
    if (players > 0) stat += `, ${players} players`
    if (pending > 0) stat += `, ${pending} pending`
  }
  hStat.innerText = stat
}

function renderQuestion() {
  renderStatus()
  let h = ""
  h += "<button onclick=handlePrev()>Prev</button> <button onclick=handleNext()>Next</button>\n"
  h += makeQuestionHTML(g.currentQuestion)
  hGameScreen.innerHTML = h

  let fsz = 300
  hGameScreen.style.fontSize = `${fsz}px`
  while (fsz >= 12 && (hGameUI.scrollWidth + hGameUI.offsetLeft > innerWidth || hGameUI.scrollHeight + hGameUI.offsetTop > innerHeight)) {
    fsz = Math.floor(0.9 * fsz)
    hGameScreen.style.fontSize = `${fsz}px`
  }
}

function handleHash() {
  hIntro.hidden = true
  hSeedPreview.hidden = true
  hPrintable.hidden = true
  hGameUI.hidden = true

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
    renderQuestion()
    return
  }
  if (location.hash.startsWith("#join-")) {
    hGameUI.hidden = false
    join()
    return
  }

  hIntro.hidden = false
}

function handleFullscreen() {
  // Ignore errors, we don't care.
  if (hFullscreen.checked) {
    document.documentElement.requestFullscreen().catch(() => {})
  } else {
    document.exitFullscreen().catch(() => {})
  }
  renderQuestion()
}

function handleJump() {
  g.questionIndex = g.shuffledqs.length
  let [idx, total] = [parseInt(hJumpIndex.value), 0]
  for (let i = 0; i < g.shuffledqs.length; i++) {
    if (!g.categories[g.shuffledqs[i][0]]) continue
    total++
    if (total == idx) {
      g.questionIndex = i
      break
    }
  }
  renderQuestion()
}

// Parses data into g.questionsDB.
// Returns an error message if there were errors, an empty string otherwise.
function handleParse() {
  let data = questionsdata
  if (hCustomDB.checked) data = hCustomText.value
  let category = "unset-category"
  let knownCategories = new Set(["personal", "divisive", "spicy", "partner", "dares-light", "dares-spicy"])
  let invalidCategories = new Set()
  let qs = []
  for (let line of data.split("\n")) {
    line = line.trim()
    if (line == "" || line.startsWith("#")) continue
    if (line.startsWith("@")) {
      category = line.substr(1)
      if (!knownCategories.has(category)) invalidCategories.add(category)
      continue
    }
    let parts = line.split("@")
    for (let i in parts) parts[i] = parts[i].trim()
    qs.push([category].concat(parts))
  }
  g.questions = qs
  shuffle()

  if (!hCustomDB.checked) {
    hCustomQuestionsReport.innerText = `custom questions not enabled`
  } else if (invalidCategories.size > 0) {
    hCustomQuestionsReport.innerText = `found invalid categories: ${Array.from(invalidCategories.values()).join(", ")}`
  } else {
    hCustomQuestionsReport.innerText = `found ${qs.length} entries`
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

const signalingServer = "https://iio.ie/sig"
const rtcConfig = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] }

function renderNetworkStatus() {
  if (g.clientMode) {
    if (g.networkStatus != "") {
      hNetwork.hidden = false
      hNetwork.innerText = "network: " + g.networkStatus
    } else {
      hNetwork.hidden = true
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
    hNetwork.innerText = "network: " + parts.join("; ")
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
  let c = new client(clientID, conn, channel)
  g.clients.push(c)
  let updateStatus = (msg: string) => {
    c.networkStatus = msg
    renderNetworkStatus()
  }
  let error = async (msg: string) => {
    updateStatus(msg)
    await new Promise((resolve) => setTimeout(resolve, 5000))
    conn.close()
    g.clients.splice(g.clients.indexOf(c), 1)
    renderNetworkStatus()
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
  updateStatus("")

  conn.oniceconnectionstatechange = async (ev) => {
    if (conn.iceConnectionState != "disconnected") return
    error(`error: lost connection to ${c.username == "" ? " a follower" : c.username}`)
  }
  channel.send("q" + [`card ${g.filteredIndex + 1}/${g.filteredQuestions}`].concat(g.currentQuestion).join("@"))
}

async function handleHost() {
  if (!hHostGame.checked) {
    if (g.aborter != null) g.aborter.abort()
    setNetworkStatus("")
    hHostcode.disabled = false
    hHostURL.hidden = true
    return
  }

  let hostcode = hHostcode.value
  localStorage.setItem("Hostcode", hHostcode.value)

  let href = location.origin + `/#join-${hostcode}`
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
    let channel = ((await eventPromise(conn, "datachannel")) as RTCDataChannelEvent).channel

    conn.oniceconnectionstatechange = async (ev) => {
      if (conn.iceConnectionState != "disconnected") return
      conn.close()
      setNetworkStatus("error: lost connection (will try again soon)")
      await new Promise((resolve) => setTimeout(resolve, 5000 + Math.random() * 10))
      join()
    }

    channel.onmessage = (ev) => {
      let msg = (ev as MessageEvent).data
      console.log(msg)
      if (msg.startsWith("q")) {
        let parts = msg.split("@")
        if (parts.length <= 2) return
        g.currentPos = parts[0].substr(1)
        g.currentQuestion = parts.slice(1)
        renderQuestion()
      }
    }

    g.conn = conn
    g.channel = channel
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
  window.onresize = () => {
    if (location.hash == "#play") renderQuestion()
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
    hHostcode.value = `${storedHostcode}`
  }

  // Load join code if stored.
  let storedJoincode = localStorage.getItem("Joincode")
  if (storedHostcode != null && hJoincode.value == "") {
    hJoincode.value = `${storedJoincode}`
  }

  handleParse()
  handleHost()
  handleHash()
}

main()
