const socket = io()//recieve and send events

//Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $locationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix:true })

const autoscroll = () => {
    //New message element
    const $newMessage = $messages.lastElementChild

    //Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)//gets style of message
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)//converts the margin pixels to int
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin//adds the margin pixels to height

    //visible height
    const visibleHeight = $messages.offsetHeight

    //Height of messages container 
    const containerHeight = $messages.scrollHeight

    //how far have i scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset) {//findout if you were at the bottom before the new message came in
          $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message', (message) => {
         console.log(message)
         const html = Mustache.render(messageTemplate, {
             username: message.username,
             message: message.text,
             createdAt: moment(message.createdAt).format('h:mm:ss a')
         })
         $messages.insertAdjacentHTML('beforeend', html)
         autoscroll()
})

socket.on('locationMessage', (url) => {
    console.log(url)
    const link = Mustache.render(locationTemplate, {
        username: url.username,
        url: url.link,
        createdAt: moment(url.createdAt).format('h:mm:ss a')
    })
    $messages.insertAdjacentHTML('beforeend', link)
    autoscroll()
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})
   
$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled')//disables the button when the message is sent

    const message =  e.target.elements.message.value //d
       
    socket.emit('sendMessage', message, (error) => {//emitting sends a callback function to reciever for 'event acknowledgement'
    $messageFormButton.removeAttribute('disabled')//re-enables the button after the message is sent
    $messageFormInput.value = ''
    $messageFormInput.focus()

    if(error){
            return console.log(error)
        }

        console.log('Message Delivered')
    })
})

$locationButton.addEventListener('click', () => {
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser')
    }

    $locationButton.setAttribute('disabled', 'disabled')
    
    navigator.geolocation.getCurrentPosition((position) => {
       socket.emit('sendlocation', {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
       }, () => {
           $locationButton.removeAttribute('disabled')
           console.log('The location has been sent')
       })
    })
   
})

// socket.on('countUpdated', (count) =>{ //the first param must match with what you sending from the server side
//    console.log('The count has been updated', count)
// })

// document.querySelector('#increment').addEventListener('click', () => {
//     console.log('printing click to the terminal')

//     socket.emit('increment')
// })

socket.emit('join', { username, room }, (error) => {
    if(error){
        alert(error)
        location.href = '/'
    }
})