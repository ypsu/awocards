declare var hCustomDB: HTMLInputElement
declare var hCustomQuestionsReport: HTMLElement
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
declare var hStat: HTMLInputElement

declare var hqPersonal: HTMLInputElement
declare var hqDivisive: HTMLInputElement
declare var hqSpicy: HTMLInputElement
declare var hqPartner: HTMLInputElement
declare var hqDaresLight: HTMLInputElement
declare var hqDaresSpicy: HTMLInputElement

declare var questionsdata: string

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

  handleParse()
  handleHash()
}

main()
