// This file contains the logic for the game.
//
// The network works in the following way:
//
// - Each game needs a single host.
// - The host advertises that it's waiting for clients via advertising its ...-nextid signal.
// - A client reads that then an webrtc offer/answer exchange happens through the signaling server.
// - The host/client communicate via messages.
//
// All network messages are in the form of [cmd][param] where cmd is a one letter code and param can be arbitrary string.
// E.g. "qalice 2@bob 3" from a client means "q" command, "alice 2@bob 3" as param.
//
// Host->client commands:
//
// - k: Host is kicking out the player. The player has to reload the page to rejoin.
// - l: Log param on the client. For debugging.
// - p: Set player statuses and names separated via @. Each entry is "playername responsebits_number".
// - q: Set the current question.
// - v: Inform the client about the host's version number. The client should reload with the right version if there's a mismatch.
// - x: Host abandoned the game.
//
// Client->host commands:
//
// - l: Log param on the host. For debugging.
// - n: Set the username of the client. Empty or invalid param resets the client to a spectator.
// - j: Jump to specific question. Param is the new card index (1 based).
// - r: Mark the response status. Param is a responsebits number.
// - x: Client leaves.

declare var hBecomeAnswerer: HTMLElement
declare var hCustomDB: HTMLInputElement
declare var hCustomQuestionsReport: HTMLElement
declare var hCustomText: HTMLTextAreaElement
declare var hDate: HTMLInputElement
declare var hError: HTMLElement
declare var hFullscreen: HTMLInputElement
declare var hGameScreen: HTMLElement
declare var hGameUI: HTMLElement
declare var hGameVersion: HTMLElement
declare var hGroupControl: HTMLElement
declare var hHostcode: HTMLInputElement
declare var hHostGame: HTMLInputElement
declare var hHostGameLine: HTMLElement
declare var hHostURL: HTMLElement
declare var hIntro: HTMLElement
declare var hJoinButton: HTMLButtonElement
declare var hJoincode: HTMLInputElement
declare var hJoining: HTMLElement
declare var hJoinnameErr: HTMLElement
declare var hJoinname: HTMLInputElement
declare var hJumpIndex: HTMLInputElement
declare var hKick: HTMLInputElement
declare var hKickLine: HTMLElement
declare var hLastMonday: HTMLElement
declare var hNameErr: HTMLElement
declare var hName: HTMLInputElement
declare var hNavbar: HTMLElement
declare var hNeedJS: HTMLElement
declare var hNetwork: HTMLElement
declare var hNextMarker: HTMLElement
declare var hPlayers: HTMLElement
declare var hPrintable: HTMLElement
declare var hQuestion: HTMLElement
declare var hRevealMarker: HTMLElement
declare var hSeed: HTMLInputElement
declare var hSeedPreview: HTMLElement
declare var hStat: HTMLInputElement
declare var hStatusbox: HTMLElement
declare var hStatusMarker: HTMLElement
declare var hThemeDark: HTMLInputElement
declare var hThemeLight: HTMLInputElement
declare var hThemeSystem: HTMLInputElement
declare var hWeeklyCard: HTMLElement
declare var hWeeklyUI: HTMLElement

declare var questionsdata: string
declare var version: number

enum responsebits {
  empty = 0,
  answermask = 7, // lower bits are reserved for the answer id with a range of up to 7 answers, 0 means no answer
  answerermarker = 8, // marks the player as the answerer
  nextmarker = 16, // means the player voted for jumping on the next question
  revealmarker = 32, // means the player voted on revealing the answer in the activity vote game
  kickmarker = 64, // means the player voted on kicking unresponsive players
}

class statusdesc {
  emoji: string
  tag: string
  desc: string
  constructor(emoji: string, tag: string, desc: string) {
    ;[this.emoji, this.tag, this.desc] = [emoji, tag, desc]
  }
}

const statusdescs = {
  empty: new statusdesc("?", "unknown", "This is an internal error."),
  network: new statusdesc("…", "network", "Waiting for a response from the host's computer."),
  questionvolunteer: new statusdesc("👋", "volunteer", "Someone has to volunteer to answer the question."),
  darevolunteer: new statusdesc("👋", "volunteer", "Someone has to volunteer to receive the dare."),
  wait: new statusdesc("⌛", "wait", "Wait until other players make their move."),
  respond: new statusdesc("🎲", "respond", "Pick an answer."),
  guess: new statusdesc("🤔", "guess", "Guess what the answerer will answer."),
  congrats: new statusdesc("👍", "congrats", "Everyone guessed your answer correctly, congratulate them."),
  interrogate: new statusdesc("😐", "interrogate", "Some guessed your answer wrong, investigate why."),
  correct: new statusdesc("✅", "correct", "Your answer is correct."),
  wrong: new statusdesc("❌", "wrong", "Your answer is wrong."),
  plan: new statusdesc("📅", "plan", "The group is interested in the activity, make a plan for it."),
  skip: new statusdesc("🚫", "skip", "Not enough enthusiasm for this activity, skip it."),
  pick: new statusdesc("👈", "pick", "Pick someone and give them your body."),
  watch: new statusdesc("📺", "watch", "Wait until the receiver picks a volunteer and then enjoy the show."),
}

class client {
  clientID: number
  username: string
  networkStatus: string
  conn: RTCPeerConnection | null
  channel: RTCDataChannel | null

  constructor(clientID: number, conn: RTCPeerConnection | null, ch: RTCDataChannel | null) {
    this.clientID = clientID
    this.username = ""
    this.networkStatus = ""
    this.conn = conn
    this.channel = ch
  }
}

class userstatus {
  active: boolean // true iff there's an active client behind this user
  response: responsebits

  constructor() {
    this.active = true
    this.response = 0
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
  questionIndex: 0 as number,

  // The currently displayed question and its stat.
  currentQuestion: [] as question,
  filteredIndex: -1,
  filteredQuestions: -1,
  currentPos: "", // the "card 12/34" string precomputed
  gameSeed: 0,

  // To abort a sig request if there's on in flight.
  aborter: null as AbortController | null,

  // All the currently connected clients when hosting.
  // In client mode clients[0] contains the connection to the host.
  // In host mode clients[0] has null connection.
  clients: [] as client[],

  // Just to have insight into what's happening.
  networkStatus: "",

  // Player statuses as received by the p host->client message.
  playerStatuses: new Map<string, userstatus>(),

  // The last status sent, used to detect discrepancy from host.
  sentStatus: responsebits.empty,

  // Whether hosting or just connected to the client.
  // In client mode the client's connection to host is in clients[0].
  clientMode: false as boolean,

  // The fontsize of the question currently show such that it fits the screen.
  fontsize: 0 as number,

  // Which button is being pressed. That one should be colored grey.
  downbutton: responsebits.empty as responsebits,

  // In host mode this tracks the current answerer's username if set.
  answerer: "" as string,

  // If true then the users cannot interact with the answers, e.g. during the volunteer phase.
  disableInteraction: true as boolean,
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
    localStorage.removeItem("awocards.CustomQuestions")
  } else {
    localStorage.setItem("awocards.CustomQuestions", hCustomText.value)
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

function shuffle(seednumber: number) {
  selectQuestions()
  let qs = g.questions.slice()

  // Shuffle the questions.
  if (seednumber != 0) {
    seed(seednumber)
    for (let i = qs.length - 1; i > 0; i--) {
      let j = Math.floor(random() * (i + 1))
      ;[qs[i], qs[j]] = [qs[j], qs[i]]
    }
  }
  g.shuffledqs = qs
}

function handleCategoryChange() {
  let cats = ""
  for (let cat in g.categories) {
    if ((document.getElementById("hq" + cat[0]) as HTMLInputElement).checked) cats += cat[0]
  }
  localStorage.setItem("awocards.Categories", cats)
}

function handleSeedPreview() {
  shuffle(parseInt(hSeed.value))

  let html = ""
  for (let q of g.shuffledqs) {
    if (g.categories[q[0]]) html += `<li>${escapehtml(q.join(" @ "))}\n`
  }
  hSeedPreview.innerHTML = html
  location.hash = "#preview"
}

function makeQuestionHTML(q: question, name: string) {
  if (q.length <= 1) {
    return "loading..."
  }
  let answerid = 0
  let a = () => {
    answerid++
    if (name == "") return "" // not interactive mode.
    let props = `id=ha${answerid}`
    for (let ev of ["mousedown", "mouseup", "mouseleave"]) {
      props += ` on${ev}=handleMouse(event,${answerid})`
    }
    for (let ev of ["touchstart", "touchend", "touchcancel"]) {
      props += ` on${ev}=handleTouch(event,${answerid})`
    }
    return props
  }
  let p = () => {
    return `<br><em id=hp${answerid}></em>`
  }

  if (q[1].startsWith("vote: ")) {
    let h = `<p>Group vote: ${escapehtml(q[1].slice(6))}</p><ol>\n`
    h += `<li ${a()}>definitely not ${p()}</li>\n`
    h += `<li ${a()}>can be talked into it ${p()}</li>\n`
    h += `<li ${a()}>I don't mind trying ${p()}</li>\n`
    h += `<li ${a()}>definitely yes ${p()}</li>\n`
    return h + "</ol>"
  }
  if (q[1].startsWith("dare: ")) {
    let h = `<p>Dare: ${escapehtml(q[1].slice(6))}</li><ol>\n`
    if (name != "") h = `<p>Dare against ${name}'s body: ${escapehtml(q[1].slice(6))}</li><ol>\n`
    h += `<li ${a()}>no ${p()}</li>\n`
    h += `<li ${a()}>can be talked into it ${p()}</li>\n`
    h += `<li ${a()}>I don't mind trying ${p()}</li>\n`
    h += `<li ${a()}>yes ${p()}</li>\n`
    return h + "</ol>"
  }
  let h = `<p>${escapehtml(q[1])}</p><ol>`
  if (name != "") h = `<p>${name}: ${escapehtml(q[1])}</p><ol>`
  for (let i = 2; i < q.length; i++) h += `<li ${a()}>${escapehtml(q[i])} ${p()}</li>\n`
  return h + "</ol>"
}

function handlePrint() {
  selectQuestions()

  let h = ""
  for (let q of g.questions) {
    if (g.categories[q[0]]) h += `<div class=hPrintableCard><span>${makeQuestionHTML(q, "")}\n<p><em>category: ${q[0]}</em></p></span></div>`
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

function handleWeekly() {
  let cats = ""
  for (let cat in g.categories) {
    if ((document.getElementById("hq" + cat[0]) as HTMLInputElement).checked) cats += cat[0]
  }
  if (cats == "") cats = "s"
  location.hash = `#weekly-c${cats}`
}

function setDate(v: string) {
  let parts = location.hash.split("-").filter((p) => !p.startsWith("d"))
  let d = parseInt(v)
  if (d) parts.push(`d${d}`)
  location.replace(parts.join("-"))
  handleHash()
}

function renderWeekly() {
  let cats = ""
  let date = 0
  let parts = location.hash.split("-")
  parts.shift()
  while (parts.length > 0) {
    let part = parts.shift()
    if (part?.startsWith("c")) cats = part.substr(1)
    if (part?.startsWith("d")) date = parseInt(part.substr(1))
  }
  if (cats == "") cats = "s"
  if (date && hDate.value != `${date}`) hDate.value = `${date}`

  let d = new Date()
  let [yy, mm, dd] = [d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate()]
  while (new Date(Date.UTC(yy, mm - 1, dd)).getUTCDay() != 1) {
    let d = new Date(Date.UTC(yy, mm - 1, dd - 1))
    ;[yy, mm, dd] = [d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate()]
  }
  let lastMonday = (yy % 100) * 10000 + mm * 100 + dd
  hLastMonday.textContent = `${lastMonday}`
  if (!date) {
    date = lastMonday
    hDate.value = `${lastMonday}`
  }

  shuffle(1)
  let qs = []
  for (let q of g.shuffledqs) {
    if (cats.includes(q[0][0])) qs.push(q)
  }

  hWeeklyCard.innerHTML = `${makeQuestionHTML(qs[date % qs.length], "")}\n<p><em>category: ${qs[date % qs.length][0]}</em></p>`
}

function handleStart() {
  g.gameSeed = parseInt(hSeed.value)
  g.questionIndex = 0
  let savegame = localStorage.getItem("awocards.Savegame")
  if (savegame != null) {
    let parts = savegame.split(" ")
    if (parts.length == 2) {
      g.questionIndex = parseInt(parts[0])
      g.gameSeed = parseInt(parts[1])
    }
  }
  shuffle(g.gameSeed)

  g.clients = [new client(-1, null, null)]
  g.playerStatuses.clear()
  handleNameChange(hName.value)
  selectQuestions()

  // Continue the game from g.questionIndex.
  if (g.questionIndex > g.shuffledqs.length) g.questionIndex = g.shuffledqs.length
  g.filteredIndex = -1
  for (let i = 0; i < g.questionIndex; i++) {
    if (g.categories[g.shuffledqs[i][0]]) g.filteredIndex++
  }
  g.questionIndex--
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

function reportClick(v: number) {
  if (v <= 7 && g.disableInteraction) {
    g.downbutton = 0
    return
  }
  let st = g.playerStatuses.get(hName.value)
  if (st == undefined) return
  let r = st.response

  if ((v & responsebits.answermask) > 0) {
    // This is an answer click.
    // Already answered? Clear answer then, otherwise set it.
    if ((st.response & responsebits.answermask) > 0) {
      r &= ~responsebits.answermask
    } else {
      r = (r & ~responsebits.answermask) | v
    }
  } else {
    // Otherwise this is a status click.
    r ^= v
  }
  g.downbutton = 0

  g.sentStatus = r
  if (g.clientMode) {
    if (g.clients.length >= 1) g.clients[0].channel?.send(`r${r}`)
  } else {
    st.response = r
    updatePlayerStatus()
  }
}

function countPlayers() {
  let c = 0
  g.playerStatuses.forEach((st) => {
    if (st.active) c++
  })
  return c
}

function handleMouse(event: MouseEvent, v: number) {
  if (g.downbutton == 0 && (event.type == "mouseleave" || event.type == "mouseup")) return
  if (event.type == "mouseleave") {
    g.downbutton = 0
    renderQuestion(rendermode.quick)
    return
  }
  if (event.button != 0) return
  if (v == g.downbutton && event.type == "mouseup") {
    reportClick(v)
  } else if (event.type == "mousedown" && (v >= 8 || !g.disableInteraction)) {
    g.downbutton = v
  }
  renderQuestion(rendermode.quick)
}

function handleTouch(event: TouchEvent, v: number) {
  event.stopPropagation()
  event.preventDefault()
  if (event.type == "touchstart" && (v >= 8 || !g.disableInteraction)) {
    g.downbutton = v
  } else if (event.type == "touchcancel") {
    g.downbutton = 0
  } else if (event.type == "touchend") {
    reportClick(v)
  }
  renderQuestion(rendermode.quick)
}

function handleKick() {
  reportClick(responsebits.kickmarker)
}

function updateCurrentQuestion() {
  // Reset responses.
  g.playerStatuses.forEach((st) => (st.response = responsebits.empty))
  g.sentStatus = responsebits.empty
  updatePlayerStatus()

  if (g.questionIndex == g.shuffledqs.length) {
    g.currentQuestion = ["none", "vote: Game over because out of questions. Play again with spicier categories?"]
  } else {
    g.currentQuestion = g.shuffledqs[g.questionIndex]
  }
  g.currentPos = `card ${g.filteredIndex + 1}/${g.filteredQuestions}`
  for (let c of g.clients) c.channel?.send("q" + [`${g.filteredIndex}`, `${g.filteredQuestions}`].concat(g.currentQuestion).join("@"))
  localStorage.setItem("awocards.Savegame", `${g.questionIndex} ${g.gameSeed}`)

  // Remove inactive players here, good point as any.
  g.playerStatuses.forEach((st, name) => {
    if (!st.active) g.playerStatuses.delete(name)
  })
}

function updatePlayerStatus() {
  if (g.clientMode) {
    g.answerer = ""
    g.playerStatuses.forEach((st, name) => {
      if (st.active && st.response & responsebits.answerermarker) g.answerer = name
    })
    return
  }
  g.playerStatuses.forEach((st) => (st.active = false))
  for (let c of g.clients) {
    if (c.networkStatus == "" && c.username != "") {
      let st = g.playerStatuses.get(c.username)
      if (st != undefined) {
        st.active = true
      } else {
        g.playerStatuses.set(c.username, new userstatus())
      }
    }
  }

  let statusmsg = [] as string[]
  let [nextcnt, kickcnt] = [0, 0]
  g.answerer = ""
  g.playerStatuses.forEach((st, name) => {
    if (st.active) statusmsg.push(`${name} ${st.response}`)
    if (st.active && (st.response & responsebits.answerermarker) > 0) g.answerer = name
    if (st.active && (st.response & responsebits.nextmarker) > 0) nextcnt++
    if (st.active && (st.response & responsebits.kickmarker) > 0) kickcnt++
  })
  statusmsg.sort((a, b) => {
    if (a < b) return -1
    if (a > b) return +1
    return 0
  })
  let msg = "p" + statusmsg.join("@")
  for (let c of g.clients) c.channel?.send(msg)
  if (nextcnt >= 2) handleNext()

  if (kickcnt >= 2) {
    let hostkicked = false
    for (let c of g.clients) {
      if (c.username == "") continue
      let st = g.playerStatuses.get(c.username)
      if (st == null || (st.response & responsebits.answermask) > 0 || (st.response & responsebits.answerermarker) > 0) continue
      c.username = ""
      if (c == g.clients[0]) {
        hostkicked = true
      } else {
        c.channel?.send("k")
      }
    }
    g.sentStatus = g.sentStatus & ~responsebits.kickmarker
    g.playerStatuses.forEach((st) => {
      st.response = st.response & ~responsebits.kickmarker
    })
    updatePlayerStatus()
    if (hostkicked) alert("You have been kicked out of the game due to inactivity. Reload the game to rejoin.")
  }
}

function renderStatus() {
  let stat = `${g.currentPos}, category ${g.currentQuestion[0]}`

  let isplayer = g.playerStatuses.has(hName.value)
  let playercnt = 0
  g.playerStatuses.forEach((st, name) => {
    if (st.active) playercnt++
  })
  if (g.clientMode || g.clients.length >= 2) {
    if (hName.value == "") {
      stat += ", you are spectating because you have not set a username"
    } else if (!isplayer) {
      stat += ", you are spectating because you were kicked"
    } else {
      stat += ", your username is " + hName.value
    }
  }

  if (!g.clientMode) {
    let [clients, players, spectators, pending] = [0, 0, 0, 0]
    let clientcnt = new Map<string, number>()
    for (let c of g.clients) {
      if (c.networkStatus != "" && c.conn != null) pending++
      if (c.networkStatus == "" && c.username == "") spectators++
      if (c.networkStatus == "" && c.username != "") clientcnt.set(c.username, (clientcnt.get(c.username) ?? 0) + 1)
    }
    g.playerStatuses.forEach((st) => {
      if (st.active) players++
    })
    let multiclientusers: string[] = []
    clientcnt.forEach((cnt, u) => {
      clients += cnt
      if (cnt >= 2) multiclientusers.push(u)
    })
    if (g.clients.length >= 2) {
      if (g.clients[0].username == "") spectators--
      if (spectators > 0) stat += `, ${spectators} spectators`
      if (players > 0) stat += `, ${players} players`
      if (clients != players) stat += `, ${clients} clients <span class=cfgNegative>(user(s) ${multiclientusers.join(", ")} have multiple!)</span>`
      if (pending > 0) stat += `, ${pending} pending`
    }
  }
  hStat.innerHTML = stat
}

enum rendermode {
  quick,
  full,
}

let lastRenderedName = ""
function renderQuestion(mode: rendermode) {
  renderStatus()

  if (g.currentQuestion.length == 0) {
    hQuestion.textContent = "loading..."
    return
  }

  // Not connected to host yet, that's the only case where the clients array can be empty.
  // Ignore that, the interface doesn't have to be interactible in that case.
  if (g.clients.length == 0) {
    return
  }

  let isdare = g.currentQuestion[1].startsWith("dare: ")
  let isvote = g.currentQuestion[1].startsWith("vote: ")
  let isquestion = !isdare && !isvote

  // Collect various data from which to compute and render the current game status.
  let revealed = false
  let bgclass = ""
  let allanswers: number[] = []
  let playercnt = 0
  let [answerer, answer, answererResponse] = ["", 0, 0]
  let isplayer = g.playerStatuses.has(hName.value)
  let playeranswer = 0
  let playerresponse = 0
  let pendingPlayers = 0
  let revealcnt = 0
  g.playerStatuses.forEach((st, name) => {
    if (st.active) playercnt++
    if (st.active && (st.response & responsebits.answermask) > 0) allanswers.push(st.response & responsebits.answermask)
    if (st.active && (st.response & responsebits.answerermarker) != 0) {
      ;[answerer, answer, answererResponse] = [name, st.response & responsebits.answermask, st.response]
    }
    if (st.active && name == hName.value) playerresponse = st.response
    if (st.active && (st.response & responsebits.answermask) > 0 && name == hName.value) playeranswer = st.response & responsebits.answermask
    if (st.active && name != answerer && (st.response & responsebits.answermask) == 0) pendingPlayers++
    if (st.active && (st.response & responsebits.revealmarker) > 0) revealcnt++
  })
  let isanswerer = hName.value != "" && hName.value == answerer
  let isspectator = !isplayer

  // Render the question.
  if (mode == rendermode.full || answerer != lastRenderedName) {
    if ("wakeLock" in navigator) navigator.wakeLock.request("screen")
    lastRenderedName = answerer
    let a = playercnt >= 2 && answerer == "" ? "?" : answerer
    hQuestion.innerHTML = makeQuestionHTML(g.currentQuestion, a)
    g.fontsize = 300
    hGameScreen.style.fontSize = `300px`
  }

  // Compute the hGroupControl visibility status and its text.
  let answererText = ""
  hNavbar.hidden = isplayer && playercnt >= 2
  hGroupControl.hidden = true
  hStatusbox.hidden = true
  hPlayers.hidden = true
  if (playercnt >= 2 && !isplayer) {
    hStatusbox.hidden = false
    hPlayers.hidden = false
  } else if (playercnt >= 2) {
    hGroupControl.hidden = false
    hStatusbox.hidden = false
    hBecomeAnswerer.hidden = !((isquestion || isdare) && (answerer == "" || isanswerer))
    hRevealMarker.hidden = !(pendingPlayers > 0 && (isvote || (isdare && answerer != "") || (isquestion && answer != 0)))
    hPlayers.hidden = false

    hRevealMarker.textContent = `${(playerresponse & responsebits.revealmarker) > 0 ? "[x]" : "[ ]"} skip wait (needs 2 players)`
    hNextMarker.textContent = `${(playerresponse & responsebits.nextmarker) > 0 ? "[x]" : "[ ]"} next question (needs 2 players)`
    let answerertype = isdare ? "receiver" : "answerer"
    hBecomeAnswerer.textContent = `${answerer == hName.value ? "[x]" : "[ ]"} become ${answerertype}`

    hBecomeAnswerer.className = g.downbutton == responsebits.answerermarker ? "cfgNeutral" : ""
    hNextMarker.className = g.downbutton == responsebits.nextmarker ? "cfgNeutral" : ""
    hRevealMarker.className = g.downbutton == responsebits.revealmarker ? "cfgNeutral" : ""
  }
  hKickLine.hidden = playercnt <= 1
  hKick.checked = (playerresponse & responsebits.kickmarker) > 0

  // Compute each player's statusbox.
  g.disableInteraction = !isplayer || playercnt <= 1 || (isanswerer && isdare)
  if (playercnt >= 2) {
    let status = statusdescs.empty
    if (isquestion) {
      if (answerer == "") {
        status = statusdescs.questionvolunteer
        g.disableInteraction = true
      } else if (isplayer && playeranswer == 0 && isanswerer) {
        status = statusdescs.respond
      } else if (isplayer && playeranswer == 0) {
        status = statusdescs.guess
      } else if (answer == 0 || (pendingPlayers > 0 && revealcnt <= 1)) {
        status = statusdescs.wait
      } else if ((isanswerer || !isplayer) && allanswers.every((v) => v == answer)) {
        status = statusdescs.congrats
        revealed = true
      } else if (isanswerer || !isplayer) {
        status = statusdescs.interrogate
        revealed = true
      } else if (playeranswer == answer) {
        status = statusdescs.correct
        revealed = true
      } else {
        status = statusdescs.wrong
        revealed = true
      }
    }
    if (isvote) {
      let [mn, mx] = [Math.min(...allanswers), Math.max(...allanswers)]
      let ok = mn >= 3 || (mn >= 2 && mx == 4)
      if (isplayer && playeranswer == 0) {
        status = statusdescs.respond
      } else if (pendingPlayers > 0 && revealcnt <= 1) {
        status = statusdescs.wait
      } else if (ok) {
        status = statusdescs.plan
        revealed = true
      } else {
        status = statusdescs.skip
        revealed = true
      }
    }
    if (isdare) {
      let hasvolunteer = allanswers.some((v) => v >= 2)
      if (answerer == "") {
        status = statusdescs.darevolunteer
        g.disableInteraction = true
      } else if (isplayer && !isanswerer && playeranswer == 0) {
        status = statusdescs.respond
      } else if (pendingPlayers > 0 && revealcnt <= 1) {
        status = statusdescs.wait
      } else if (hasvolunteer && isanswerer) {
        status = statusdescs.pick
        revealed = true
      } else if (hasvolunteer) {
        status = statusdescs.watch
        revealed = true
      } else {
        status = statusdescs.skip
        revealed = true
      }
    }
    if (playerresponse != g.sentStatus) status = statusdescs.network
    hStatusMarker.innerHTML = `${status.emoji} ${status.tag}<br><span style=font-size:initial>${status.desc}</span>`
  }

  // Render the emoji coded player status line.
  let players = [] as string[]
  g.playerStatuses.forEach((st, name) => {
    if (!st.active) return
    let panswer = st.response & responsebits.answermask
    if (!revealed) {
      if (isdare && name == answerer) {
        players.push(`${name} 👋`)
      } else if (panswer == 0) {
        players.push(`${name} 🎲`)
      } else {
        players.push(`${name} ⌛`)
      }
      return
    }
    if (revealed && isvote) {
      if (panswer == 0) {
        players.push(`${name} 🎲`)
      } else if (panswer == 1) {
        players.push(`${name} ❌`)
      } else {
        players.push(`${name} ✅`)
      }
      return
    }
    if (revealed && isdare) {
      if (name == answerer) {
        players.push(`${name} 👋`)
      } else if (panswer == 0) {
        players.push(`${name} 🎲`)
      } else if (panswer == 1) {
        players.push(`${name} ❌`)
      } else {
        players.push(`${name} ✅`)
      }
      return
    }
    if (panswer == 0) {
      players.push(`${name} 🎲`)
    } else if (name == answerer) {
      players.push(`${name} 👋`)
    } else if (panswer == answer) {
      players.push(`${name} ✅`)
    } else {
      players.push(`${name} ❌`)
    }
  })
  players.sort()
  hPlayers.innerHTML = "Players: " + players.join(", ")

  // Render player names if revealed.
  let answerNames: string[][] = [[], [], [], [], []]
  if (revealed) {
    g.playerStatuses.forEach((st, name) => {
      if (isdare && name == answerer) return
      if (st.active) answerNames[st.response & responsebits.answermask].push(name)
    })
  }
  for (let i = 1; i <= 4; i++) {
    let e = document.getElementById(`hp${i}`)
    answerNames[i].sort()
    let namelist = "&nbsp;"
    if (answerNames[i].length > 0) namelist = `[${answerNames[i].join(", ")}]`
    if (e != null) e.innerHTML = namelist
  }

  // Color answers as needed.
  let answerClass = ["", "", "", "", "", ""]
  if (isquestion && revealed) {
    answerClass[answer] = "cfgPositive"
    if (playeranswer != answer) answerClass[playeranswer] = "cfgNegative"
  }
  if (g.downbutton < 4) answerClass[g.downbutton] = "cfgNeutral"
  for (let id = 1; id <= 4; id++) {
    let elem = document.getElementById(`ha${id}`)
    if (elem != null) elem.className = answerClass[id]
  }

  // Shrink to fit.
  let [w, h] = [innerWidth, 0.9 * innerHeight]
  while (g.fontsize >= 12 && (hGameUI.scrollWidth + hGameUI.offsetLeft > w || hGameUI.scrollHeight + hGameUI.offsetTop > h)) {
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
  // Close all connections.
  disconnectAll()

  hQuestion.innerHTML = ""
  hIntro.hidden = true
  hSeedPreview.hidden = true
  hPrintable.hidden = true
  hGameUI.hidden = true
  hWeeklyUI.hidden = true
  hHostGameLine.hidden = true
  document.body.className = ""

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
  if (location.hash == "#restart") {
    localStorage.removeItem("awocards.Savegame")
    location.replace("#play")
  }
  if (location.hash == "#play") {
    hHostGameLine.hidden = false
    handleStart()
    hGameUI.hidden = false
    renderQuestion(rendermode.full)
    return
  }
  if (location.hash.startsWith("#join-")) {
    hGameUI.hidden = false
    hJoining.textContent = "Joining..."
    hJoining.hidden = false
    hGameUI.hidden = true
    join()
    return
  }
  if (location.hash.startsWith("#weekly-")) {
    hWeeklyUI.hidden = false
    renderWeekly()
    return
  }

  hIntro.hidden = false
}

function handleMarkerClick(bit: responsebits) {
  // Find current response.
  let response = null
  let st = g.playerStatuses.get(hName.value)
  if (g.clients.length == 0 || st == null) return
  if (g.clientMode) {
    g.clients[0].channel?.send(`r${st.response ^ bit}`)
  } else {
    st.response ^= bit
    updatePlayerStatus()
    renderQuestion(rendermode.quick)
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
    } else {
      qs.push([category].concat(parts))
    }
  }
  g.questions = qs

  let err = ""
  if (invalidCategories.size > 0) {
    err = `found invalid categories: ${Array.from(invalidCategories.values()).join(", ")}`
  } else if (badcards > 0) {
    err = `found ${badcards} bad cards, last one is "${badcard}", reason: ${badreason}`
  }

  if (!hCustomDB.checked) {
    hCustomQuestionsReport.textContent = ""
    if (err != "") seterror(err)
  } else {
    if (err != "") {
      hCustomQuestionsReport.textContent = `Error: ${err}.`
    } else {
      hCustomQuestionsReport.textContent = `Found ${qs.length} entries.`
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

function handleJoinnameChange(s: string) {
  if (s != "" && !validateName(s)) {
    hJoinname.className = "cbgNegative"
    hJoinnameErr.textContent = "invalid name, must be at most 12 alphanumeric characters"
    s = ""
  } else {
    hJoinname.className = ""
    hJoinnameErr.textContent = ""
  }
  hName.value = s
  localStorage.setItem("awocards.Username", s)
  hJoinButton.textContent = hJoinname.value == "" ? "Spectate" : "Join"
  hJoinButton.disabled = hJoincode.value == ""
}

function handleNameChange(s: string) {
  if (s != "" && !validateName(s)) {
    hName.className = "cbgNegative"
    hNameErr.textContent = "invalid name, must be at most 12 alphanumeric characters"
    s = ""
  } else {
    hName.className = ""
    hNameErr.textContent = ""
  }
  hJoinname.value = s
  localStorage.setItem("awocards.Username", s)
  if (g.clientMode) {
    if (g.clients.length >= 1) g.clients[0].channel?.send("n" + s)
    return
  }
  if (g.clients.length > 0) g.clients[0].username = s
  updatePlayerStatus()
  renderQuestion(rendermode.quick)
}

const signalingServer = "https://iio.ie/sig"
const rtcConfig = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] }

function renderNetworkStatus() {
  if (g.clientMode) {
    hNetwork.hidden = false
    if (g.networkStatus != "") {
      hNetwork.textContent = "Network status: " + g.networkStatus
    } else {
      hNetwork.textContent = "Network status: connected"
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
    hNetwork.textContent = "Network status: " + parts.join("; ")
  } else {
    hNetwork.hidden = true
  }
  renderStatus()
}

function setNetworkStatus(s: string) {
  g.networkStatus = s
  if (hJoining.textContent != "") hJoining.textContent = "Joining: " + s
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
    error(`error: lost connection to ${c.username == "" ? "a spectator" : c.username}`)
    updatePlayerStatus()
    renderQuestion(rendermode.full)
  }
  channel.onmessage = async (ev) => {
    let msg = (ev as MessageEvent).data
    if (msg.length == 0) return
    let param = msg.substr(1)
    switch (msg[0]) {
      case "j":
        handleJump(param)
        break
      case "l":
        console.log("Client log request:", param)
        return
      case "n":
        if (!validateName(param)) param = ""
        c.username = param
        updatePlayerStatus()
        renderQuestion(rendermode.full)
        break
      case "r":
        let r = parseInt(param)
        if (r != r || c.username == "") break
        let st = g.playerStatuses.get(c.username)
        if (st != undefined) {
          // Clear the answerer bit from the response if some other player is already the answerer.
          if ((r & responsebits.answerermarker) > 0 && g.answerer != "" && g.answerer != c.username) r &= ~responsebits.answerermarker
          st.response = r
        }
        updatePlayerStatus()
        renderQuestion(rendermode.quick)
        break
      case "x":
        error(`${c.username == "" ? "a spectator" : c.username} exited`)
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
    response = await fetch(`${signalingServer}?set=awocards-${hostcode}-${clientID}-offer&timeoutms=5000`, {
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
    response = await fetch(`${signalingServer}?get=awocards-${hostcode}-${clientID}-answer&timeoutms=5000`, { method: "POST" })
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
  channel.send(`v${version}`)
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
  localStorage.setItem("awocards.Hostcode", hHostcode.value)

  let href = location.origin + location.pathname + `#join-${hostcode}`
  hHostcode.disabled = true
  hHostURL.innerHTML = `<br>join link: <a href='${href}'>${href}</a>`
  hHostURL.hidden = false

  setNetworkStatus("initializing")
  g.aborter = new AbortController()
  let aborter = g.aborter

  for (let clientID = 1; ; clientID++) {
    if (aborter.signal.aborted) {
      return
    }
    let response
    // Advertise the next client ID.
    setNetworkStatus("waiting for next client")
    try {
      response = await fetch(`${signalingServer}?set=awocards-${hostcode}-nextid`, {
        method: "POST",
        body: `${clientID}`,
        signal: aborter.signal,
      })
    } catch (e) {
      if (aborter.signal.aborted) {
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
  localStorage.setItem("awocards.Joincode", joincode)

  g.clientMode = true
  g.playerStatuses.clear()
  g.aborter = new AbortController()
  let aborter = g.aborter
  while (true) {
    let jointime = Date.now()
    let response
    setNetworkStatus("awaiting server's signal")
    try {
      response = await fetch(`${signalingServer}?get=awocards-${joincode}-nextid&timeoutms=600000`, { method: "POST" })
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
      response = await fetch(`${signalingServer}?get=awocards-${joincode}-${clientID}-offer&timeoutms=5000`, { method: "POST" })
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
      if (Date.now() - jointime < 60000) {
        // Avoid rapid retrying.
        await new Promise((resolve) => setTimeout(resolve, 5000 + Math.random() * 10))
      }
      join()
    }

    conn.ondatachannel = (ev) => {
      let channel = (ev as RTCDataChannelEvent).channel
      if (aborter?.signal.aborted) {
        channel.send("x")
        conn.close()
        return
      }
      g.clients = [new client(0, conn, channel)]
      hJoining.textContent = ""
      hJoining.hidden = true
      hGameUI.hidden = false
      handleNameChange(hName.value)
      channel.onmessage = async (ev) => {
        let msg = (ev as MessageEvent).data
        if (msg.length == 0) return
        let [cmd, param] = [msg[0], msg.slice(1)]
        switch (cmd) {
          case "k":
            alert("You have been kicked out of the game due to inactivity. Reload the game to rejoin.")
            g.sentStatus = 0
            return
          case "l":
            console.log("Host log request:", param)
            return
          case "p":
            g.playerStatuses.clear()
            g.sentStatus = 0 // pre-clear for the kicked out player case.
            for (let s of param.split("@")) {
              let sp = s.split(" ")
              if (sp.length != 2) continue
              let st = new userstatus()
              st.response = parseInt(sp[1])
              if (!st.response) st.response = 0
              g.playerStatuses.set(sp[0], st)
              if (sp[0] == hName.value) g.sentStatus = st.response
            }
            updatePlayerStatus()
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
          case "v":
            let hostversion = parseInt(param)
            if (version != hostversion) {
              location.replace(`${location.origin}/v${param}.html${location.hash}`)
            }
            return
          case "x":
            conn.oniceconnectionstatechange = null
            channel.onmessage = null
            conn.close()
            g.clients = []
            setNetworkStatus("error: host abandoned the game (will try reconnecting soon)")
            renderQuestion(rendermode.quick)
            if (Date.now() - jointime < 60000) {
              // Avoid rapid retrying.
              await new Promise((resolve) => setTimeout(resolve, 5000 + Math.random() * 10))
            }
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
      response = await fetch(`${signalingServer}?set=awocards-${joincode}-${clientID}-answer`, {
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

let darkPreference = matchMedia("(prefers-color-scheme:dark)")
function setTheme() {
  if (hThemeDark.checked || (hThemeSystem.checked && darkPreference.matches)) {
    document.documentElement.style.colorScheme = "dark"
    document.documentElement.setAttribute("data-theme", "dark")
  } else {
    document.documentElement.style.colorScheme = "light"
    document.documentElement.setAttribute("data-theme", "light")
  }

  if (hThemeDark.checked) {
    localStorage.setItem("awocards.Theme", "dark")
  } else if (hThemeLight.checked) {
    localStorage.setItem("awocards.Theme", "light")
  } else {
    localStorage.removeItem("awocards.Theme")
  }
}

function seterror(msg: string) {
  hError.textContent = `Error: ${msg}.\nReload the page to try again.`
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
  hGameVersion.textContent = `Game version: v${version}`
  if (version != 0) {
    hGameVersion.innerHTML = `Game version: v${version} (dev version at <a href=/v0.html>/v0.html</a>)`
  }

  darkPreference.addEventListener("change", setTheme)
  setTheme()

  let addToggleHandlers = (h: HTMLElement, v: number) => {
    h.onmousedown = (event: MouseEvent) => handleMouse(event, v)
    h.onmouseup = (event: MouseEvent) => handleMouse(event, v)
    h.onmouseleave = (event: MouseEvent) => handleMouse(event, v)
    h.ontouchstart = (event: TouchEvent) => handleTouch(event, v)
    h.ontouchend = (event: TouchEvent) => handleTouch(event, v)
    h.ontouchcancel = (event: TouchEvent) => handleTouch(event, v)
  }
  addToggleHandlers(hBecomeAnswerer, responsebits.answerermarker)
  addToggleHandlers(hRevealMarker, responsebits.revealmarker)
  addToggleHandlers(hNextMarker, responsebits.nextmarker)

  // Init category names.
  for (let cat of ["softball", "divisive", "intimate", "partner", "light-dares", "hot-dares", "activities", "naughty-activities"]) {
    g.categories[cat] = false
  }

  // Init seed with current day.
  let now = new Date()
  hSeed.value = `${(now.getMonth() + 1) * 100 + now.getDate()}`

  // Load custom questions from localstorage if there are some.
  let storedQuestions = localStorage.getItem("awocards.CustomQuestions")
  if (storedQuestions != null) hCustomText.value = storedQuestions

  // Load or generate host code.
  let storedHostcode = localStorage.getItem("awocards.Hostcode")
  if (storedHostcode == null && hHostcode.value == "") {
    let hostcode = Math.round(1000 + Math.random() * (9999 - 1000))
    hHostcode.value = `${hostcode}`
  } else if (storedHostcode != null) {
    hHostcode.value = storedHostcode
  }

  // Load join code if stored.
  let storedJoincode = localStorage.getItem("awocards.Joincode")
  if (storedJoincode != null && hJoincode.value == "") {
    hJoincode.value = storedJoincode
  }

  // Load name if stored.
  let storedName = localStorage.getItem("awocards.Username")
  if (storedName != null && hJoinname.value == "" && hName.value == "") {
    hJoinname.value = storedName
    hName.value = storedName
  }
  hJoinButton.textContent = hJoinname.value == "" ? "Spectate" : "Join"
  hJoinButton.disabled = hJoincode.value == ""

  // Load categories if stored.
  let storedCategories = localStorage.getItem("awocards.Categories")
  if (storedCategories != null) {
    for (let cat in g.categories) {
      let elem = document.getElementById("hq" + cat) as HTMLInputElement
      if (elem != null) elem.checked = false
    }
    for (let cat of storedCategories) {
      let elem = document.getElementById("hq" + cat) as HTMLInputElement
      if (elem != null) elem.checked = true
    }
  }

  // Load theme if stored.
  let storedTheme = localStorage.getItem("awocards.Theme")
  if (storedTheme == "light") {
    hThemeLight.checked = true
  } else if (storedTheme == "dark") {
    hThemeDark.checked = true
  } else {
    hThemeSystem.checked = true
  }
  setTheme()

  handleParse()
  handleHash()
}

main()
