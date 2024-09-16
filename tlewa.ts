declare var hCustomQuestionsCount: HTMLElement
declare var hCustomText: HTMLTextAreaElement
declare var hError: HTMLElement
declare var hFullscreen: HTMLInputElement
declare var hIntro: HTMLElement
declare var hGameUI: HTMLElement
declare var hGameScreen: HTMLElement
declare var hNeedJS: HTMLElement
declare var hPrintable: HTMLElement
declare var hSeed: HTMLInputElement
declare var hSeedPreview: HTMLElement

declare var hqPersonal: HTMLInputElement
declare var hqDivisive: HTMLInputElement
declare var hqSpicy: HTMLInputElement
declare var hqPartner: HTMLInputElement
declare var hqDares: HTMLInputElement
declare var hqCustom: HTMLInputElement

declare var questionsdata: string

type question = string[]

let g = {
  // All questions for each category.
  questionsDB: {} as Record<string, question[]>,

  // The selected list of questions in randomized order.
  questionsList: [] as question[],

  // The current question index.
  questionIndex: -1 as number,
}

function escapehtml(unsafe: string) {
  return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;")
}

function updateCustomQuestions() {
  let category = "custom"
  let qs = []
  for (let line of hCustomText.value.split("\n")) {
    line = line.trim()
    if (line == "" || line.startsWith("#")) continue
    if (line.startsWith("@")) {
      category = line.substr(1)
      continue
    }
    let parts = line.split("@")
    for (let i in parts) parts[i] = parts[i].trim()
    qs.push([category].concat(parts))
  }
  g.questionsDB["custom"] = qs
  hCustomQuestionsCount.innerText = `${qs.length}`
}

function saveCustomQuestions() {
  updateCustomQuestions()
  if (hCustomText.value == "") {
    localStorage.removeItem("CustomQuestions")
  } else {
    localStorage.setItem("CustomQuestions", hCustomText.value)
  }
}

let saveCustomQuestionsTimeout: number
function handleCustomTextChange() {
  clearTimeout(saveCustomQuestionsTimeout)
  saveCustomQuestionsTimeout = setTimeout(saveCustomQuestions, 2000)
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
  let qs = []
  if (hqPersonal.checked) qs.push(...g.questionsDB["personal"])
  if (hqDivisive.checked) qs.push(...g.questionsDB["divisive"])
  if (hqSpicy.checked) qs.push(...g.questionsDB["spicy"])
  if (hqPartner.checked) qs.push(...g.questionsDB["partner"])
  if (hqDares.checked) qs.push(...g.questionsDB["dares"])
  if (hqCustom.checked) qs.push(...g.questionsDB["custom"])
  g.questionsList = qs
}

function generateQuestionList() {
  selectQuestions()
  let qs = g.questionsList

  // Shuffle the questions.
  let seednumber = parseInt(hSeed.value)
  if (seednumber != 0) {
    seed(seednumber)
    for (let i = qs.length - 1; i > 0; i--) {
      let j = Math.floor(random() * (i + 1))
      ;[qs[i], qs[j]] = [qs[j], qs[i]]
    }
  }
}

function handleSeedPreview() {
  generateQuestionList()

  let html = ""
  for (let q of g.questionsList) {
    html += `<li>${escapehtml(q.join(" @ "))}\n`
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
  for (let q of g.questionsList) {
    h += `<div class=hPrintableCard><span>${makeQuestionHTML(q)}</span></div>`
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
  generateQuestionList()
  g.questionIndex = 0
  location.hash = "#play"
}

function handlePrev() {
  if (g.questionIndex >= 1) g.questionIndex--
  renderQuestion()
}

function handleNext() {
  if (g.questionIndex < g.questionsList.length) g.questionIndex++
  renderQuestion()
}

function renderQuestion() {
  let h = ""
  if (g.questionIndex >= g.questionsList.length) {
    h = "<p>Out of questions, game finished.</p>"
  } else {
    h += makeQuestionHTML(g.questionsList[g.questionIndex])
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

function seterror(msg: string) {
  hError.innerText = `Error: ${msg}.\nReload the page to try again.`
  hError.hidden = false
  document.body.classList.add("cbgNeutral")
}

function main() {
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

  // Parse the embedded questions.
  let category = ""
  for (let line of questionsdata.split("\n")) {
    line = line.trim()
    if (line == "" || line.startsWith("#")) continue
    if (line.startsWith("@")) {
      category = line.substr(1)
      continue
    }
    let parts = line.split("@")
    for (let i in parts) parts[i] = parts[i].trim()
    if (g.questionsDB[category] == undefined) g.questionsDB[category] = []
    g.questionsDB[category].push([category].concat(parts))
  }
  updateCustomQuestions()
  if (Object.keys(g.questionsDB).length != 6) {
    seterror(`found ${Object.keys(g.questionsDB).length} question categories, want 6`)
  }

  hNeedJS.hidden = true
  handleHash()
}

main()
