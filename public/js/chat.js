const socket = io()
    //Elements
const $Messageform = document.querySelector('#Messageform')
const $inputform = $Messageform.querySelector('input') //document.querySelector('input')
const $buttonform = document.querySelector('button')
const $sendlocation = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')
const $sidebar = document.querySelector("#sidebar")
    //Template
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplarte = document.querySelector('#sidebar-template').innerHTML
const autoscroll = () => {
    //new message element
    const $newMessages = $messages.lastElementChild
        //Height of new message
    const newMessageStyles = getComputedStyle($newMessages)
    const newMessagesMargin = parseInt(newMessageStyles.marginBottom)
    const newMessagesHeight = $newMessages.offsetHeight + newMessagesMargin
        //visble height
    const visbleHeight = $messages.offsetHeight
        //Height of messages container
    const containerHeight = $messages.scrollHeight
        //how far have i scrolled?
    const scrolloffset = $messages.scrollTop + visbleHeight + 1
    console.log(containerHeight - newMessagesHeight)
    console.log(scrolloffset)
    if (containerHeight - newMessagesHeight <= scrolloffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
    // $messages.scrollTop = $messages.scrollHeight
}
socket.on("Location-message", (url) => {
        console.log(url)
        const html = Mustache.render(locationTemplate, {
                username: url.username,
                url: url.url,
                CreatedAt: moment(url.CreatedAt).format('hh:mm a')
            })
            //     //const hml2 = Mustache.render(message)
        $messages.insertAdjacentHTML("beforeend", html)
        autoscroll();
    })
    //options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });
// console.log(username + " " + room)
socket.on("message", (message) => {
        console.log(message)
        const html = Mustache.render(messageTemplate, {
                username: message.username,
                message: message.text,
                time: moment(message.CreatedAt).format("h:mm a")
            })
            //const hml2 = Mustache.render(message)

        $messages.insertAdjacentHTML("beforeend", html)
        autoscroll();

    })
    // const form = document.querySelector('#Messageform');
    // const Message = document.querySelector('input');
$Messageform.addEventListener('submit', (e) => {
    //disable the form
    e.preventDefault();
    $buttonform.setAttribute('disabled', 'disabled')
        // console.log(document.querySelector('input').value);
        // socket.emit("Sendmessage", document.querySelector('message').value)
    socket.emit("Sendmessage", $inputform.value, (error) => {
        $buttonform.removeAttribute('disabled')
        $inputform.value = ''
        $inputform.focus()
        if (error) {
            return console.log(error)
        }
        console.log("Delivered!")
            //enable the form

    })

})
$sendlocation.addEventListener('click', () => {

    if (!navigator.geolocation) {
        return alert('Geolocation is not supported in your browser!')
    }
    $sendlocation.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((postion) => {
        // console.log(postion)
        socket.emit("sendLocation", {
            latitude: postion.coords.latitude,
            longitude: postion.coords.longitude
        }, (message) => {
            $sendlocation.removeAttribute('disabled')
            console.log(message)
        })
    })
})
socket.emit("join", {
    username,
    room
}, (error) => {
    if (error) {

        alert(error)
        location.href = '/'

    }
})
socket.on("roomData", ({ room, users }) => {
        // console.log(room)
        // console.log(users)
        const html = Mustache.render(sidebarTemplarte, {
                room,
                users
            })
            // $sidebar.insertAdjacentHTML("beforeend", html)
        $sidebar.innerHTML = html
    })
    // socket.on("CountUpdated", (count) => {
    //         console.log("The Count has been updated!", count++)
    //     })
    //     // const message_1 = document.querySelector("#Message-1")
    //     // message_1.textContent = "Deepak"
    // document.querySelector('#increment').addEventListener('click', () => {
    //     console.log("Clicked")
    //     socket.emit("increment")
    // });