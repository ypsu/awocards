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
// E.g. "qalice 2@bob 3" from a client means "q" command, "alice 2@bob 3" as param.
//
// Host->client commands:
//
// - l: Log param on the client. For debugging.
// - p: Set player statuses and names separated via @. Each entry is "playername responsebits_number".
// - q: Set the current question.
// - x: Host abandoned the game.
//
// Client->host commands:
//
// - l: Log param on the host. For debugging.
// - n: Set the username of the client. Empty or invalid param resets the client to a spectator.
// - j: Jump to specific question. Param is the new card index (1 based).
// - r: Mark the response status. Param is a responsebits number.
// - x: Client leaves.

declare var hAnswerer: HTMLElement
declare var hBecomeAnswerer: HTMLElement
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
declare var hNavbar: HTMLElement
declare var hNetwork: HTMLElement
declare var hNextMarker: HTMLElement
declare var hHostcode: HTMLInputElement
declare var hIntro: HTMLElement
declare var hJoincode: HTMLInputElement
declare var hJumpIndex: HTMLInputElement
declare var hNeedJS: HTMLElement
declare var hPlayers: HTMLElement
declare var hPrintable: HTMLElement
declare var hQuestion: HTMLElement
declare var hRevealMarker: HTMLElement
declare var hSeed: HTMLInputElement
declare var hSeedPreview: HTMLElement
declare var hStat: HTMLInputElement

declare var questionsdata: string

enum responsebits {
  empty = 0,
  answermask = 7, // lower bits are reserved for the answer id with a range of up to 7 answers, 0 means no answer
  answerermarker = 8, // marks the player as the answerer
  nextmarker = 16, // means the player voted for jumping on the next question
  revealmarker = 32, // means the player voted on revealing the answer in the activity vote game
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

  // Player statuses as received by the p host->client message.
  playerStatuses: new Map<string, userstatus>(),

  // Whether hosting or just connected to the client.
  // In client mode the client's connection to host is in clients[0].
  clientMode: false as boolean,

  // The fontsize of the question currently show such that it fits the screen.
  fontsize: 0 as number,

  // The focused answer ID, the answer being pushed down.
  focusedAnswerID: 0 as number,

  // In host mode this tracks the current answerer's username if set.
  answerer: "" as string,
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

function makeQuestionHTML(q: question, interactive: boolean) {
  if (q.length <= 1) {
    return "loading..."
  }
  let answerid = 0
  let a = () => {
    answerid++
    if (!interactive) return ""
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
    return h
  }
  if (q[1].startsWith("dare: ")) {
    let h = `<p>Dare: ${escapehtml(q[1].slice(6))}</li><ol>\n`
    h += `<li ${a()}>no ${p()}</li>\n`
    h += `<li ${a()}>can be talked into it ${p()}</li>\n`
    h += `<li ${a()}>I don't mind trying ${p()}</li>\n`
    h += `<li ${a()}>yes ${p()}</li>\n`
    return h + "</ol>"
  }
  let h = `<p>${escapehtml(q[1])}</p><ol>`
  for (let i = 2; i < q.length; i++) h += `<li ${a()}>${escapehtml(q[i])} ${p()}</li>\n`
  return h + "</ol>"
}

function handlePrint() {
  selectQuestions()

  let h = ""
  for (let q of g.questions) {
    if (g.categories[q[0]]) h += `<div class=hPrintableCard><span>${makeQuestionHTML(q, false)}</span></div>`
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
  g.playerStatuses.clear()
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

function reportAnswer(v: number) {
  let st = g.playerStatuses.get(hName.value)
  if (st == undefined) return
  let r = st.response
  if ((st.response & responsebits.answermask) > 0) {
    // Already answered? Clear answer then.
    r &= ~responsebits.answermask
  } else {
    r = (r & ~responsebits.answermask) | v
  }
  if (g.clientMode) {
    g.clients[0].channel?.send(`r${r}`)
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
  if (
    g.clients.length == 0 ||
    !g.playerStatuses.has(hName.value) ||
    countPlayers() <= 1 ||
    (g.answerer == hName.value && g.currentQuestion[1].startsWith("dare: "))
  ) {
    // single player mode, client not connected, or spectator mode, do nothing.
  } else if (event.type == "mouseleave") {
    g.focusedAnswerID = 0
  } else if (event.type == "mouseup") {
    if (v == g.focusedAnswerID) reportAnswer(v)
    g.focusedAnswerID = 0
  } else if (event.type == "mousedown" && (event.buttons & 1) == 1) {
    g.focusedAnswerID = v
  }
  renderQuestion(rendermode.quick)
}

function handleTouch(event: TouchEvent, v: number) {
  event.stopPropagation()
  event.preventDefault()
  if (
    g.clients.length == 0 ||
    !g.playerStatuses.has(hName.value) ||
    countPlayers() <= 1 ||
    (g.answerer == hName.value && g.currentQuestion[1].startsWith("dare: "))
  ) {
    // single player mode, client not connected, or spectator mode, do nothing.
  } else if (event.type == "touchstart") {
    g.focusedAnswerID = v
  } else if (event.type == "touchcancel") {
    g.focusedAnswerID = 0
  } else if (event.type == "touchend") {
    if (v == g.focusedAnswerID) reportAnswer(v)
    g.focusedAnswerID = 0
  }
  renderQuestion(rendermode.quick)
}

function updateCurrentQuestion() {
  // Reset responses.
  g.playerStatuses.forEach((st) => (st.response = responsebits.empty))
  updatePlayerStatus()

  if (g.questionIndex == g.shuffledqs.length) {
    g.currentQuestion = ["none", "vote: Game over because out of questions. Play again with spicier categories?"]
  } else {
    g.currentQuestion = g.shuffledqs[g.questionIndex]
  }
  g.currentPos = `card ${g.filteredIndex + 1}/${g.filteredQuestions}`
  for (let c of g.clients) c.channel?.send("q" + [`${g.filteredIndex}`, `${g.filteredQuestions}`].concat(g.currentQuestion).join("@"))

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
  let nextcnt = 0
  g.answerer = ""
  g.playerStatuses.forEach((st, name) => {
    if (st.active) statusmsg.push(`${name} ${st.response}`)
    if (st.active && st.response & responsebits.answerermarker) g.answerer = name
    if (st.active && (st.response & responsebits.nextmarker) > 0) nextcnt++
  })
  statusmsg.sort((a, b) => {
    if (a < b) return -1
    if (a > b) return +1
    return 0
  })
  let msg = "p" + statusmsg.join("@")
  for (let c of g.clients) c.channel?.send(msg)
  if (nextcnt >= 2) handleNext()
}

function renderStatus() {
  let stat = `${g.currentPos}, category ${g.currentQuestion[0]}`
  if (!g.clientMode) {
    let [clients, players, spectators, pending] = [0, 0, 0, 0]
    for (let c of g.clients) {
      if (c.networkStatus != "" && c.conn != null) pending++
      if (c.networkStatus == "" && c.username == "") spectators++
      if (c.networkStatus == "" && c.username != "") clients++
    }
    g.playerStatuses.forEach((st) => {
      if (st.active) players++
    })
    if (g.clients.length >= 2) {
      if (g.clients[0].username == "") spectators--
      if (spectators > 0) stat += `, ${spectators} spectators`
      if (players > 0) stat += `, ${players} players`
      if (clients != players) stat += `, ${clients} clients <span class=cfgNegative>(some clients have identical names!)</span>`
      if (pending > 0) stat += `, ${pending} pending`
    }
  }
  hStat.innerHTML = stat

  let players = [] as string[]
  g.playerStatuses.forEach((st, name) => {
    if (!st.active) return
    if (name == g.answerer) {
      players.push(`<span  class=cfgReference>${name}</span>`)
    } else if ((st.response & responsebits.answermask) > 0) {
      players.push(`<span class=cfgNotice>${name}</span>`)
    } else {
      players.push(name)
    }
  })
  players.sort()
  hPlayers.innerHTML = "Players: " + players.join(", ")
}

enum rendermode {
  quick,
  full,
}

function renderQuestion(mode: rendermode) {
  renderStatus()

  if (g.currentQuestion.length == 0) {
    hQuestion.innerText = "loading..."
    return
  }

  // Not connected to host yet, that's the only case where the clients array can be empty.
  // Ignore that, the interface doesn't have to be interactible in that case.
  if (g.clients.length == 0) {
    document.body.className = "cbgNeutral"
    return
  }

  if (mode == rendermode.full) {
    if ("wakeLock" in navigator) navigator.wakeLock.request("screen")
    hQuestion.innerHTML = makeQuestionHTML(g.currentQuestion, true)
    g.fontsize = 300
    hGameScreen.style.fontSize = `300px`

    // Update player count based parts of the interface.
    let playercnt = g.playerStatuses.size
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

  let isdare = g.currentQuestion[1].startsWith("dare: ")
  let isvote = g.currentQuestion[1].startsWith("vote: ")
  let isquestion = !isdare && !isvote

  // Collect various data from which to compute and render the current game status.
  let revealed = false
  let bgclass = ""
  let allanswers: number[] = []
  let playercnt = 0
  let [answerer, answer] = ["", 0]
  let isplayer = g.playerStatuses.has(hName.value)
  let playeranswer = 0
  let playerresponse = 0
  let pendingPlayers = 0
  let revealcnt = 0
  g.playerStatuses.forEach((st, name) => {
    if (st.active) playercnt++
    if (st.active && (st.response & responsebits.answermask) > 0) allanswers.push(st.response & responsebits.answermask)
    if (st.active && (st.response & responsebits.answerermarker) != 0) [answerer, answer] = [name, st.response & responsebits.answermask]
    if (st.active && name == hName.value) playerresponse = st.response
    if (st.active && (st.response & responsebits.answermask) > 0 && name == hName.value) playeranswer = st.response & responsebits.answermask
    if (st.active && name != answerer && (st.response & responsebits.answermask) == 0) pendingPlayers++
    if (st.active && (st.response & responsebits.revealmarker) > 0) revealcnt++
  })
  let isanswerer = hName.value != "" && hName.value == answerer
  let isspectator = !isplayer

  // Compute the hGroupControl visibility status and its text.
  let answererText = ""
  hNavbar.hidden = isplayer && playercnt >= 2
  if (playercnt <= 1) {
    hGroupControl.hidden = true
  } else {
    hGroupControl.hidden = false
    hAnswerer.hidden = isplayer && !isvote && answerer == ""
    hBecomeAnswerer.hidden = isspectator || isvote || (answerer != "" && answerer != hName.value)
    hRevealMarker.hidden = !isvote || playercnt < 3
    hNextMarker.hidden = !isplayer

    hRevealMarker.innerText = `${(playerresponse & responsebits.revealmarker) > 0 ? "[x]" : "[ ]"} force reveal (needs 2 players)`
    hNextMarker.innerText = `${(playerresponse & responsebits.nextmarker) > 0 ? "[x]" : "[ ]"} next question (needs 2 players)`

    let answerertype = isdare ? "receiver" : "answerer"
    if (isquestion) {
      if (isanswerer) {
        if (pendingPlayers == 0 && answer != 0) answererText = "round done"
        if (pendingPlayers == 0 && answer == 0) answererText = "all ready, answer now!"
        if (pendingPlayers > 0 && answer == 0) answererText = `wait, ${pendingPlayers} guessers pending`
        if (pendingPlayers > 0 && answer != 0) answererText = `round done, ${pendingPlayers} unanswered`
      } else {
        if (answer != 0) answererText = `${answerertype} is ${answerer == "" ? "?" : answerer}, round done`
        if (pendingPlayers > 0 && answer == 0) {
          answererText = `${answerertype} is ${answerer == "" ? "?" : answerer}, ${playercnt - allanswers.length - 1} guessers pending`
        }
        if (pendingPlayers == 0 && answer == 0) answererText = `${answerertype} is ${answerer == "" ? "?" : answerer}, waiting on answer`
      }
    } else if (isdare) {
      if (isanswerer) {
        if (pendingPlayers == 0) answererText = "round done"
        if (pendingPlayers > 0) answererText = `${pendingPlayers} responses pending`
      } else {
        if (pendingPlayers > 0) answererText = `${answerertype} is ${answerer == "" ? "?" : answerer}, ${playercnt - allanswers.length - 1} responses pending`
        if (pendingPlayers == 0) answererText = `${answerertype} is ${answerer == "" ? "?" : answerer}, round done`
      }
    } else if (isvote) {
      if (allanswers.length == playercnt) answererText = `round done`
      if (allanswers.length != playercnt) answererText = `${playercnt - allanswers.length} responses pending`
    }
    hBecomeAnswerer.innerText = `${answerer == hName.value ? "[x]" : "[ ]"} become ${answerertype}`
  }

  // Check win condition and determine background color.
  if (playercnt >= 2) {
    if (isquestion) {
      if (answer != 0) {
        revealed = true
        if (isanswerer || !isplayer) {
          let allcorrect = allanswers.every((v) => v == answer)
          bgclass = allcorrect ? "cbgPositive" : "cbgNegative"
          answererText += allcorrect ? ", all correct" : ", some incorrect"
        } else if (playeranswer != 0) {
          bgclass = playeranswer == answer ? "cbgPositive" : "cbgNegative"
          answererText += playeranswer == answer ? ", you guessed right!" : ", you guessed wrong!"
        }
      } else if (isanswerer) {
        bgclass = pendingPlayers == 0 ? "cbgSpecial" : "cbgReference"
      } else if (playercnt == 2 && allanswers.length == 2) {
        revealed = true
        bgclass = allanswers[0] == allanswers[1] ? "cbgPositive" : "cbgNegative"
        hBecomeAnswerer.hidden = true
        hAnswerer.hidden = false
        answererText = allanswers[0] == allanswers[1] ? "you agree" : "you disagree"
      }
    } else if (isdare) {
      if (answerer != "" && pendingPlayers == 0) {
        revealed = true
        let hasvolunteer = allanswers.some((v) => v >= 2)
        if (isanswerer || !isplayer) {
          bgclass = hasvolunteer ? "cbgPositive" : "cbgNegative"
          answererText += hasvolunteer ? ", there are volunteers" : ", no volunteers"
        } else if (isplayer) {
          bgclass = playeranswer >= 2 ? "cbgPositive" : "cbgNegative"
          answererText += hasvolunteer ? ", there are volunteers" : ", no volunteers"
        }
      } else if (isanswerer) {
        bgclass = "cbgReference"
      } else if (playercnt == 2 && allanswers.length == 2) {
        revealed = true
        let [mn, mx] = [Math.min(...allanswers), Math.max(...allanswers)]
        bgclass = mn >= 2 && mx >= 3 ? "cbgPositive" : "cbgNegative"
        hBecomeAnswerer.hidden = true
        hAnswerer.hidden = false
        answererText = mn >= 2 && mx >= 3 ? "go for the activity!" : "skip the activity"
      }
    } else if (isvote) {
      console.log("revealcnt", revealcnt)
      if (allanswers.length == playercnt || (revealcnt >= 2 && allanswers.length >= 1)) {
        revealed = true
        let [mn, mx] = [Math.min(...allanswers), Math.max(...allanswers)]
        let ok = mn >= 3 || (mn >= 2 && mx == 4)
        bgclass = ok ? "cbgPositive" : "cbgNegative"
        answererText += ok ? ", go for the activity!" : ", skip the activity"
      }
    }
  }
  hAnswerer.innerText = answererText

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
  answerClass[g.focusedAnswerID] = "cfgNeutral"
  for (let id = 1; id <= 4; id++) {
    let elem = document.getElementById(`ha${id}`)
    if (elem != null) elem.className = answerClass[id]
  }

  // Color the background as needed.
  let r = g.playerStatuses.get(hName.value)
  if (r == undefined || !r.active || playercnt == 1) {
    // This is a spectator client.
    document.body.className = bgclass
  } else if (bgclass != "") {
    // Result ready.
    document.body.className = bgclass
  } else if ((r.response & responsebits.answermask) > 0 && (!isdare || answerer != hName.value)) {
    // Answered, waiting for reveal.
    document.body.className = "cbgNotice"
  } else {
    // Waiting for answer.
    document.body.className = ""
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

  hIntro.hidden = true
  hSeedPreview.hidden = true
  hPrintable.hidden = true
  hGameUI.hidden = true
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
    if (g.clients.length >= 1) g.clients[0].channel?.send("n" + s)
    return
  }
  g.clients[0].username = s
  updatePlayerStatus()
  renderQuestion(rendermode.quick)
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
  g.playerStatuses.clear()
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
          case "l":
            console.log("Host log request:", param)
          case "p":
            g.playerStatuses.clear()
            for (let s of param.split("@")) {
              let sp = s.split(" ")
              if (sp.length != 2) continue
              let st = new userstatus()
              st.response = parseInt(sp[1])
              if (!st.response) st.response = 0
              g.playerStatuses.set(sp[0], st)
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
          case "x":
            conn.oniceconnectionstatechange = null
            channel.onmessage = null
            conn.close()
            g.clients = []
            setNetworkStatus("error: host abandoned the game (will try reconnecting soon)")
            renderQuestion(rendermode.quick)
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
