import Events from 'events'
import TerminalController from "./src/terminal-controller.js";

const componentEmitter = new Events()
const controller = new TerminalController()

await controller.initializeTable(componentEmitter)
