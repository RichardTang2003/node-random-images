const readline = require('readline');
const fs = require('fs');
const express = require('express');
const schedule = require('node-schedule');
const readLastLines = require('read-last-lines');

const app = express();

// 文件处理
let resolutionList = [];
let fileObjList = {};

class FileObject {
  constructor(resolution, fileName, whichOneInArr) {
    this.resolution = resolution;
    this.fileName = fileName;
    this.whichOneInArr = whichOneInArr - 1;
    this.counts = this.counts || 0;
    fileObjList[this.resolution] = this;
    resolutionList.push(this.resolution);
  };

  readFile() {
    let file = fs.createReadStream(this.fileName);
    let lineArr = readline.createInterface({ input: file });
    let imgArr = [];
    lineArr.on('line', line => imgArr.push(line));
    lineArr.on('close', () => {
      this.arr = imgArr.concat();
      console.log(`${this.resolution}p分辨率图片总计${this.arr.length}张`)
    });
  }

  readLog(readedArr) {
    if (readedArr[this.whichOneInArr] !== undefined) console.log(`成功读取${this.resolution}图片历史记录`);
    this.counts = Number(readedArr[this.whichOneInArr] || 0);
  }
}

//########################!请直接在此处添加更多文件!#############################
//##################!格式：(路径，读取的文件，记录位置)!##########################
const fileObject540 = new FileObject('540', 'data540.txt', 1);
const fileObject540raw = new FileObject('540raw', 'data540raw.txt', 2);
const fileObject720 = new FileObject('720', 'data720.txt', 3);
const fileObject1080 = new FileObject('1080', 'data1080.txt', 4);

const port = 3000;
const time = '0 * * * *'
//###########################################################################

// 读取文件
for (obj in fileObjList) fileObjList[obj].readFile();

// 每小时报告访问量
const job = schedule.scheduleJob(time, () => {
  let countsArr = [];
  for (obj in fileObjList) countsArr[fileObjList[obj].whichOneInArr] = fileObjList[obj].counts;
  fs.appendFile('log.txt', new Date() + ':' + JSON.stringify(countsArr) + '\n', err => {
    if (err) console.log(err);
  });
});

// 监听端口 express
app.get('/', (req, res) => {
  res.send(`Use route /540 /720 or /1080 instead for 540p 720p or 1080p images.</br>Use '?format=raw' for png/jpg format.</br>Current images counts: ${fileObject540.arr.length}*540p　${fileObject720.arr.length}*720p　${fileObject1080.arr.length}*1080p</br>Made with ❤️ by illlights && Made for freedom to come.`);
});

app.get('/:resolution', (req, res) => {
  let resolution = req.params.resolution;
  //全部随机，实际上是先随机file再随机line
  if (resolution === 'random') {
    let whichResolution = Math.floor(Math.random() * resolutionList.length);
    let obj = fileObjList[ resolutionList[whichResolution] ];
    let whichArr = Math.floor(Math.random() * obj.arr.length);
    obj.counts++;
    res.redirect(obj.arr[whichArr]);
  }
  //判断是否有请求的路径对应文件
  else if (!(resolutionList.includes(resolution))) res.send('bad request.');
  //请求是否带raw参数 && 是否支持raw参数
  else if (req.query.format == 'raw' && fileObjList[resolution + 'raw'] !== undefined) {
    let whichArr = Math.floor(Math.random() * fileObjList[resolution + 'raw'].arr.length);
    fileObjList[resolution + 'raw'].counts++;
    res.redirect(fileObjList[resolution + 'raw'].arr[whichArr]);
  } 
  //返回一般结果
  else {
    let whichArr = Math.floor(Math.random() * fileObjList[resolution].arr.length);
    fileObjList[resolution].counts++;
    res.redirect(fileObjList[resolution].arr[whichArr]);
  }  
})

app.listen(port, () => console.log('express正在监听'+ port +'端口.'));

//读取log文件
readLastLines.read('log.txt', 1)
	.then(line => {
    if (line.includes('[') && line.includes(']')) {
      let readedCountsArr = line.split('[')[1].split(']')[0].split(',');
      console.log('成功读取log文件:' + readedCountsArr);
      for (let obj in fileObjList) fileObjList[obj].readLog(readedCountsArr);
    } else {
      console.log('无请求历史记录.')
      for (let obj in fileObjList) fileObjList[obj].readLog([]);
    }
  });