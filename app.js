const readline = require('readline');
const fs = require('fs');
const express = require('express');
const schedule = require('node-schedule');
const readLastLines = require('read-last-lines');

const app = express();

// 文件处理
let fileObjList = {
  resolutions: []
};

class FileObject {
  constructor(resolution, fileName) {
    this.resolution = resolution;
    this.fileName = fileName;
    this.counts = 0;
  };

  readFile() {
    let file = fs.createReadStream(this.fileName);
    let lineArr = readline.createInterface({ input: file });
    let imgArr = [];
    lineArr.on('line', line => imgArr.push(line));
    lineArr.on('close', () => {
      this.arr = imgArr.concat();
      console.log(`${this.resolution}p分辨率图片总计${this.arr.length}张`)
      fileObjList[this.resolution] = this;
      fileObjList.resolutions.push(this.resolution);
    });
  }

  readLog(whichOneInArr) {
    let resolution = this.resolution;
    //这样写要读四次log文件，故弃用
  }
}

const fileObject540 = new FileObject('540', 'data540.txt');
const fileObject720 = new FileObject('720', 'data720.txt');
const fileObject1080 = new FileObject('1080', 'data1080.txt');
const fileObject540raw = new FileObject('540raw', 'data540raw.txt');


fileObject540.readFile();
fileObject540raw.readFile();
fileObject720.readFile();
fileObject1080.readFile();

// 每小时报告访问量 依次为540p 540p-raw 720p 1080p 
const job = schedule.scheduleJob('0 * * * *', () => {
  const time = new Date();
  let countsArr = [fileObject540.counts, fileObject540raw.counts, fileObject720.counts, fileObject1080.counts]
  fs.appendFile('log.txt', time + ':' + JSON.stringify(countsArr) + '\n', err => {
    if (err) console.log(err);
  });
});

// 监听端口 express
app.get('/', (req, res) => {
  res.send(`Use route /540 /720 or /1080 instead for 540p 720p or 1080p images. Use '?format=raw' for png/jpg format.</br>Current images counts: ${fileObject540.arr.length}*540p　${fileObject720.arr.length}*720p　${fileObject1080.arr.length}*1080p</br>Made with ❤️ by illlights && Made for freedom to come.`);
});

app.get('/:resolution', (req, res) => {
  let resolution = req.params.resolution;
  if (!(fileObjList.resolutions.includes(resolution))) res.send('bad request.');
  else if (req.query.format == 'raw' && fileObjList[resolution + 'raw'] !== undefined) {
    let whichArr = Math.floor(Math.random() * fileObjList[resolution + 'raw'].arr.length);
    fileObjList[resolution + 'raw'].counts++;
    res.redirect(fileObjList[resolution + 'raw'].arr[whichArr]);
  } 
  else {
    let whichArr = Math.floor(Math.random() * fileObjList[resolution].arr.length);
    fileObjList[resolution].counts++;
    res.redirect(fileObjList[resolution].arr[whichArr] + '?image&action=format:t_webp|crop:g_0');
  }  
});

app.listen(3000, () => {
  console.log('express正在监听3000端口.')
});

//read log
readLastLines.read('log.txt', 1)
	.then(line => {
    let readedCountsArr = line.split('[')[1].split(']')[0].split(',');
    readedCountsArr = readedCountsArr || [0, 0, 0 ,0];
    console.log('成功读取log文件:' + readedCountsArr);
    for (let obj in fileObjList) {
      if (obj === 'resolutions') continue; //跳过那个只有名字的数组
      switch (fileObjList[obj].resolution) {
        case '540':
          fileObjList[obj].counts = Number(readedCountsArr[0]);
          console.log('540p记录读取完成');
          break;
        case '540raw':
          fileObjList[obj].counts = Number(readedCountsArr[1]);
          console.log('540praw记录读取完成');
          break;
        case '720':
          fileObjList[obj].counts = Number(readedCountsArr[2]);
          console.log('720p记录读取完成');
          break;
        case '1080':
          fileObjList[obj].counts = Number(readedCountsArr[3]);
          console.log('1080p记录读取完成');
          break;
        
        default:
          console.warn(`记录文件中找不到${fileObjList[obj].resolution}的记录值，请检查`);
      }
    }
  });