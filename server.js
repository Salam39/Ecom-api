import http from "http";
import app from "./app/app.js";

// Now here we are going to create a server

const PORT = 5001;
const server = http.createServer(app);
server.listen(PORT, console.log(`Server has started at port number ${PORT}`));