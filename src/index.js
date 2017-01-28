const Task = require('data.task')
require('whatwg-fetch')

const URL = 'https://andruxnet-random-famous-quotes.p.mashape.com/?cat=famous'
const headers = new Headers({
  'X-Mashape-Key': 'NvBtBmdtSImshF8Ul6PZVcHM8rPtp1HIevIjsnu6b1nua1d11M',
  'Content-Type': 'application/x-www-form-urlencoded',
  'Accept': 'application/json'
})

/**
* A function that takes a URL and returns a Task
* @param {string} URL
*/
const getQuotes = () =>
  new Task((rej, res) => {
    window.fetch(URL, { method: 'POST', headers: headers, cache: 'default' })
      .then(r => r.json())
      .then(res)
      .catch(rej)
  })

const fetchQuotes = () => {
  getQuotes()
    .fork(error => {
      const errorMessage = document.querySelector('.error')
      errorMessage.textContent = error
    }, data => {
      const quote = document.querySelector('.quote')
      const credit = document.querySelector('.credit')
      const tweet = document.querySelector('.tweet')
      quote.textContent = data.quote
      credit.textContent = `— ${data.author} —`
      tweet.href = `https://twitter.com/intent/tweet?text=${data.quote} -- ${data.author}`
    })
}

window.onload = () => {
  fetchQuotes()
  const button = document.querySelector('.button')
  button.addEventListener('click', fetchQuotes)
}
