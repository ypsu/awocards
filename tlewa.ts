declare var hCustomDB: HTMLInputElement
declare var hCustomQuestionsReport: HTMLElement
declare var hCustomText: HTMLTextAreaElement
declare var hError: HTMLElement
declare var hFullscreen: HTMLInputElement
declare var hGameUI: HTMLElement
declare var hGameScreen: HTMLElement
declare var hHostGame: HTMLInputElement
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
  username: string
  status: string
  conn: RTCPeerConnection
  channel: RTCDataChannel

  constructor(conn: RTCPeerConnection, ch: RTCDataChannel) {
    this.username = ""
    this.status = ""
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

  // The current question index.
  questionIndex: -1 as number,

  // To abort a sig request if there's on in flight.
  aborter: null as AbortController | null,

  // All the currently connected clients when hosting.
  clients: [] as client[],

  // Clients only: connection data towards the host.
  clientMode: false as boolean,
  conn: null as RTCPeerConnection | null,
  channel: null as RTCDataChannel | null,
  status: "" as string,
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
  g.categories = cats
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
  handleNext()
  location.hash = "#play"
}

function handlePrev() {
  g.questionIndex--
  while (g.questionIndex >= 0 && !g.categories[g.shuffledqs[g.questionIndex][0]]) g.questionIndex--
  if (g.questionIndex < 0) handleNext()
  renderQuestion()
}

function handleNext() {
  g.questionIndex++
  while (g.questionIndex < g.shuffledqs.length && !g.categories[g.shuffledqs[g.questionIndex][0]]) g.questionIndex++
  renderQuestion()
}

function renderQuestion() {
  let h = ""
  if (g.questionIndex >= g.questions.length) {
    h = "<p>Out of questions, game finished.</p>"
    hStat.innerText = "game over"
  } else {
    let [current, total] = [0, 0]
    for (let i = 0; i < g.shuffledqs.length; i++) {
      if (!g.categories[g.shuffledqs[i][0]]) continue
      total++
      if (i == g.questionIndex) current = total
    }
    h += makeQuestionHTML(g.shuffledqs[g.questionIndex])
    hStat.innerText = `card ${current}/${total}, category ${g.shuffledqs[g.questionIndex][0]}`
  }
  h += "<button onclick=handlePrev()>Prev</button> <button onclick=handleNext()>Next</button>\n"
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

async function connectToClient(hostcode: string, clientID: number) {
  // Create a description offer and upload it to the signaling service.
  let response
  let conn = new RTCPeerConnection(rtcConfig)
  let channel = conn.createDataChannel("datachannel")
  hNetwork.innerText = "hosting: creating local offer..."
  let offer = await conn.createOffer()
  conn.setLocalDescription(offer)
  hNetwork.innerText = "hosting: awaiting icegatheringstatechange == 'completed'..."
  do {
    await eventPromise(conn, "icegatheringstatechange")
  } while (conn.iceGatheringState != "complete")
  hNetwork.innerText = "hosting: waiting for a client to connect..."
  try {
    response = await fetch(`${signalingServer}?set=tlewa-${hostcode}-${clientID}-offer&timeoutms=5000`, {
      method: "POST",
      body: conn.localDescription?.sdp,
    })
  } catch (e) {
    conn.close()
    hNetwork.innerText = `hosting: error: upload offer to signaling server: ${e} (will try again soon)`
    await new Promise((resolve) => setTimeout(resolve, 5000 + Math.random() * 10))
    return
  }
  if (response.status == 204) {
    conn.close()
    return
  }

  // Establish the connection to the connecting client.
  hNetwork.innerText = "hosting: awaiting client's signal..."
  try {
    response = await fetch(`${signalingServer}?get=tlewa-${hostcode}-${clientID}-answer&timeoutms=5000`, { method: "POST" })
  } catch (e) {
    conn.close()
    return
  }
  if (response.status == 204) {
    conn.close()
    return
  }
  hNetwork.innerText = "hosting: awaiting client's sdp answer..."
  let sdp = await response.text()
  conn.setRemoteDescription({ type: "answer", sdp: sdp })
  hNetwork.innerText = "hosting: connecting to the new client..."
  await eventPromise(channel, "open")

  // TODO: handle disconnect.
  let c = new client(conn, channel)
  channel.send("hello world")
  g.clients.push(c)
}

async function handleHost() {
  if (!hHostGame.checked) {
    if (g.aborter != null) g.aborter.abort()
    hNetwork.hidden = true
    return
  }

  let hostcode = hHostcode.value
  localStorage.setItem("Hostcode", hHostcode.value)

  hNetwork.hidden = false
  hNetwork.innerText = "hosting: initializing..."
  g.aborter = new AbortController()

  for (let clientID = 1; ; clientID++) {
    let response
    // Advertise the next client ID.
    hNetwork.innerText = `hosting: waiting for next client...`
    try {
      response = await fetch(`${signalingServer}?set=tlewa-${hostcode}-nextid`, {
        method: "POST",
        body: `${clientID}`,
        signal: g.aborter.signal,
      })
    } catch (e) {
      if (g.aborter.signal.aborted) {
        return
      }
      hNetwork.innerText = `hosting: error: upload offer to signaling server: ${e} (will try again soon)`
      await new Promise((resolve) => setTimeout(resolve, 5000 + Math.random() * 10))
      continue
    }
    if (response.status == 204) {
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
  hNetwork.hidden = false
  let joincode = location.hash.substr(6)
  localStorage.setItem("Joincode", joincode)

  while (true) {
    let response
    hNetwork.innerText = "joining: awaiting server's signal..."
    try {
      response = await fetch(`${signalingServer}?get=tlewa-${joincode}-nextid&timeoutms=600000`, { method: "POST" })
    } catch (e) {
      hNetwork.innerText = `joining: error: await server's signal: ${e} (will try again soon)`
      await new Promise((resolve) => setTimeout(resolve, 5000 + Math.random() * 10))
      continue
    }
    let clientID = await response.text()

    hNetwork.innerText = "joining: awaiting server's offer..."
    try {
      response = await fetch(`${signalingServer}?get=tlewa-${joincode}-${clientID}-offer&timeoutms=5000`, { method: "POST" })
    } catch (e) {
      hNetwork.innerText = `joining: error: await server's signal: ${e} (will try again soon)`
      await new Promise((resolve) => setTimeout(resolve, 5000 + Math.random() * 10))
      continue
    }
    let offer = await response.text()
    let conn = new RTCPeerConnection(rtcConfig)

    hNetwork.innerText = "joining: awaiting icegatheringstatechange == 'complete'..."
    await conn.setRemoteDescription({ type: "offer", sdp: offer })
    conn.setLocalDescription(await conn.createAnswer())
    do {
      await eventPromise(conn, "icegatheringstatechange")
    } while (conn.iceGatheringState != "complete")

    hNetwork.innerText = "joining: sending answer..."
    try {
      response = await fetch(`${signalingServer}?set=tlewa-${joincode}-${clientID}-answer`, {
        method: "POST",
        body: conn.localDescription?.sdp,
      })
    } catch (e) {
      hNetwork.innerText = `joining: error: sending answer: ${e} (will try again soon)`
      await new Promise((resolve) => setTimeout(resolve, 5000 + Math.random() * 10))
      continue
    }
    let channel = ((await eventPromise(conn, "datachannel")) as RTCDataChannelEvent).channel

    conn.oniceconnectionstatechange = async (ev) => {
      if (conn.iceConnectionState != "disconnected") return
      hNetwork.hidden = false
      hNetwork.innerText = "joining: lost connection, will retry connection soon..."
      await new Promise((resolve) => setTimeout(resolve, 5000 + Math.random() * 10))
      join()
    }

    channel.onmessage = (ev) => {
      let msg = (ev as MessageEvent).data
      console.log(msg)
    }

    hNetwork.hidden = true
    g.conn = conn
    g.channel = channel
    break
  }
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
