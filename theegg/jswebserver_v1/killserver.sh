ps aux | grep "node server.js"| awk '{print $2}'|xargs kill -9
