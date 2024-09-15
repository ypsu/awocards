declare var hCustomQuestionsCount: HTMLElement
declare var hCustomText: HTMLTextAreaElement
declare var hError: HTMLElement
declare var hIntro: HTMLElement
declare var hNeedJS: HTMLElement
declare var hSeed: HTMLInputElement
declare var hSeedPreview: HTMLElement
declare var hSeedPreviewBack: HTMLElement
declare var hSeedPreviewQuestions: HTMLElement

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
}

function escapehtml(unsafe: string) {
  return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;")
}

function updateCustomQuestions() {
  let qs = []
  for (let line of hCustomText.value.split("\n")) {
    line = line.trim()
    if (line == "" || line.startsWith("#") || line.startsWith("@")) continue
    let parts = line.split("@")
    for (let i in parts) parts[i] = parts[i].trim()
    qs.push(parts)
  }
  g.questionsDB["custom"] = qs
  hCustomQuestionsCount.innerText = `${qs.length}`
}

function saveCustomQuestions() {
  updateCustomQuestions()
  localStorage.setItem("CustomQuestions", hCustomText.value)
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

function generateQuestionList() {
  let qs = []
  if (hqPersonal.checked) qs.push(...g.questionsDB["personal"])
  if (hqDivisive.checked) qs.push(...g.questionsDB["divisive"])
  if (hqSpicy.checked) qs.push(...g.questionsDB["spicy"])
  if (hqPartner.checked) qs.push(...g.questionsDB["partner"])
  if (hqDares.checked) qs.push(...g.questionsDB["dares"])
  if (hqCustom.checked) qs.push(...g.questionsDB["custom"])

  // Shuffle the questions.
  let seednumber = parseInt(hSeed.value)
  if (seednumber != 0) {
    seed(seednumber)
    for (let i = qs.length - 1; i > 0; i--) {
      let j = Math.floor(random() * (i + 1))
      ;[qs[i], qs[j]] = [qs[j], qs[i]]
    }
  }

  g.questionsList = qs
}

function hideall() {
  hIntro.hidden = true
  hSeedPreview.hidden = true
}

function handleSeedPreview() {
  generateQuestionList()

  let html = ""
  for (let q of g.questionsList) {
    html += `<li>${escapehtml(q.join(" @ "))}\n`
  }
  hSeedPreviewQuestions.innerHTML = html

  hideall()
  hSeedPreviewBack.onclick = () => {
    hideall()
    hIntro.hidden = false
  }
  hSeedPreview.hidden = false
}

function seterror(msg: string) {
  hError.innerText = `Error: ${msg}.\nReload the page to try again.`
  hError.hidden = false
  document.body.classList.add("cbgNeutral")
}

function main() {
  window.onerror = (msg, src, line) => seterror(`${src}:${line} ${msg}`)
  window.onunhandledrejection = (e) => seterror(e.reason)

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
    g.questionsDB[category].push(parts)
  }
  updateCustomQuestions()
  if (Object.keys(g.questionsDB).length != 6) {
    seterror(`found ${Object.keys(g.questionsDB).length} question categories, want 6`)
  }

  hNeedJS.hidden = true
}

main()
