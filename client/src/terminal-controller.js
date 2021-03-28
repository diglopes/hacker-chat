import ComponentsBuilder from "./components.js";
import { constants } from "./constants.js";

export default class TerminalController {
    #usersColors = new Map()
    
    constructor() {}

    #pickColor() {
        return `#${((1 << 24) * Math.random() | 0).toString(16)}-fg`
    }

    #getUserColor(username) {
        if(this.#usersColors.has(username)) 
            return this.#usersColors.get(username)
        const color = this.#pickColor()
        this.#usersColors.set(username, color)
        return color
    }

    #onInputReceived(eventEmitter) {
        return function() {
            const message = this.getValue()
            eventEmitter.emit('message:received', { username: 'diego', message })
            this.clearValue()
        }
    }

    #onMessageReceived({ screen, chat }) {
        return msg => {
            const { username, message } = msg
            const color = this.#getUserColor(username)
            chat.addItem(`{${color}}{bold}${username}{/}: ${message}`)
            screen.render()
        }
    }

    #onLogChanged({ screen, activityLog }) {
        return msg => {
            const [username] = msg.split(/\s/)
            const color = this.#getUserColor(username)
            activityLog.addItem(`{${color}}{bold}${msg.toString()}{/}`)
            screen.render()
        }
    }

    #onStatusChanged({ screen, status }) {
        return users => {
            const { content } = status.items.shift()
            status.clearItems()
            status.addItem(content)
            users.forEach(username => {
                const color = this.#getUserColor(username)
                status.addItem(`{${color}}{bold}${username}{/}`)
            })
            screen.render()
        }
    }

    #registerEvents(eventEmitter, components) {
        const { app  } = constants.events
        eventEmitter.on(app.MESSAGE_RECEIVED, this.#onMessageReceived(components))
        eventEmitter.on(app.ACTIVITYLOG_UPDATED, this.#onLogChanged(components))
        eventEmitter.on(app.STATUS_UPDATED, this.#onStatusChanged(components))
    }

    async initializeTable(eventEmitter) {
        const components = new ComponentsBuilder()
          .setScreen({ title: 'Hacket Chat - Diego Lopes'})
          .setLayoutComponent()
          .setInputComponent(this.#onInputReceived(eventEmitter))
          .setChatComponent()
          .setActivityLogComponent()
          .setStatusComponent()
          .build()
        this.#registerEvents(eventEmitter, components)
        components.input.focus()
        components.screen.render()
    }
}