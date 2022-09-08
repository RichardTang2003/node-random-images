基于Node.js的随机图片后端程序
-------------
Made with ❤️ by illlights && Made for freedom to come.

## 特色

+ 相较于绝大多数随机图程序，**拥有可自定义的路径配置**，可以实现分辨率分类、画师名、作品名分类。
+ 使用文本文件储存数据，相较于数据库版本**部署简单**，同时节约数据库返回时间，**加快返回速度**。
+ 重定向到外链图床链接，**节约服务器带宽、存储**。
+ nodejs节约服务器资源，**提供更高并发数**。
+ 每小时**记录调用数**，帮助您监控api调用情况。

## 部署

### 部署到服务器

*以Debian11服务器演示，请根据对应系统修改语句内容！*

1. 安装必要程序

```bash
sudo apt-get install nodejs git screen
```

2. 通过git拉取源码内容

```bash
  git clone https://github.com/RichardTang2003/node-random-images.git
  cd /node-random-images  
```

3. 配置本地文本文件

**首先，程序运行必须在`app.js`文件同级新建一个名为`log.txt`的文本文件！！**

然后可以根据实际需要创建多个txt文件用于储存图片链接。**其中一条链接占用一行**。

4. 配置源码内容

请打开`app.js`并找到下图代码位置（大约在40行）：

![vTcdS.png](https://i.imgtg.com/2022/09/05/vTcdS.png)

请将原有的四条定义删除，并以相同格式配置文件。

object变量名可以自由定义，time和port变量名不能更改。例如，图片中定义了fileObject540等一系列变量。如果要支持?format=raw参数，需要新建变量，**变量名为‘原变量名 + raw’**，如第43行示例。

函数参数的意义分别是：路径名、读取文件名、在log数组中的位置。
```js
const fileObject540 = new FileObject('path', 'data540.txt', 1);

const port = 8080;
const time = '0 * * * *'
```
上例中，可以通过`http://yourIP:8080/path`访问`data540.txt`中随机一条链接，并将调用次数记录储存在`log.txt`中第一个位置上。

5. 安装依赖并启动程序
```bash
npm i
# 然后等待安装结束
node app.js
```

现在，可以通过`http://yourIP:port`访问简介，使用你配置好的文件调用随机图片。另外，`http://yourIP:port/random`可以随机到所有文件中的一条链接。如果需要保持程序后台运行，可以使用screen命令：

```bash
screen -R images
npm i
node app.js
# 然后按Ctrl+A+D退出该窗口（挂在后台）
screen -r app #需要重新显示窗口时运行
```

### 部署至Replit

Replit项目：[https://replit.com/team/lemonlabo/images-dev](https://replit.com/team/lemonlabo/images-dev)