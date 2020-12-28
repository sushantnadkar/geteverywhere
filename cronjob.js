const fs = require("fs")
const cron = require("node-cron")


cron.schedule("0 * * * *", () => {
    fs.readdir(UPLOAD_DIR_PATH, (err, files) => {
        if (err) console.error(err)
        files.forEach((file) => {
            fs.stat(path.join(UPLOAD_DIR_PATH, file), (err, stats) => {
                let now , endTime
                if (err) return console.error(err)
                now = new Date().getTime()
                endTime = new Date(stats.ctime).getTime() + 3600000 //add 60min (3600000 milli seconds) to file creation time
                if (now > endTime) {
                    return fs.unlink(path.join(UPLOAD_DIR_PATH, file), (err) => {
                        if (err) console.error(err)
                    })
                }
            })
        })
    })
})