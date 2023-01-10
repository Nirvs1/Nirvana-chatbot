import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

let loadInterval;

//A function that loads before the AI responds
function loader(element) {
  element.textContent = '';

  loadInterval = setInterval(() => {
    element.textContent += '.';

    if (element.textContent === '....') {
      element.textContent = '';
    }
  }, 300)
}

//A function that implememnts the typing functionality which outputs letter one by one
function typeText(element, text) {
  let index = 0;

  let interval = setInterval(() => {
    if(index < text.length) {
      //we then add the character at a particular index to the innerHTML of the element
      element.innerHTML += text.charAt(index);
      index++
    } else {
      clearInterval(interval);
    }
  }, 20)
}

function generateUniqueId() {
  //to generate a unique id in javascript, we use the timestamp
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;
}

//This function creates the dfferent stripes to determine who the user will be
function chatStripe (isAi, value, uniqueId) {
  //We return a template string because it can accept enter key or span more than one line
  return (
    `
      <div class="wrapper ${isAi && 'ai'}">
        <div class="chat">
          <div class="profile">
            <img
              src="${isAi ? bot : user}"
              alt="${isAi ? 'bot' : 'user'}"
            />
          </div>
          <div class="message" id=${uniqueId}>${value}</div>
        </div>
      </div>
    `
  )
}

const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData(form);

  //user's chatstripe
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'));

  form.reset;

  //bot's chatstripe
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

  //We want the page to keep scrolling up as the AI is printing out the information
  chatContainer.scrollTop = chatContainer.scrollHeight;

  //We want to fetch this newly created DIV
  const messageDiv = document.getElementById(uniqueId);

  //We want to turn on the loader
  loader(messageDiv);

  //fetch data from the server
  const response = await fetch('http://localhost:5000', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: data.get('prompt')
    })
  })

  //We then clear the interval because we are no longer loading
  clearInterval(loadInterval);
  messageDiv.innerHTML = '';

  if(response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim();

    typeText(messageDiv, parsedData);
  } else {
    const err = await response.text();

    messageDiv.innerHTML = "Something went wrong";

    alert(err);
  }
}

//We then add an eventlistener to handle sumbit our prompts
form.addEventListener('submit', handleSubmit);
//We add the event listener for the enter key
form.addEventListener('keyup', (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e);
  }
})