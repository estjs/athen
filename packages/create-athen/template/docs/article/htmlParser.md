
使用有限状态机实现简版的html解析器
===================

 更新时间：2023年11月29日 10:12:18   作者：咖啡教室  

FSM(Finite State Machines) 有限状态机,也叫有限状态自动机,是为研究有限内存的计算过程和某些语言类而抽象出的一种计算模型,本文将使用有限状态机实现一个简版的html解析器,有需要的小伙伴可以参考下

−

##### 目录

* [有限状态机有什么用](#_label0)
* [有限状态机是怎么工作的](#_label1)
* [简版的 html 解析器](#_label2)

* [词法分析，生成 token 流](#_lab2_2_0)
* [语法分析，生成 AST 抽象语法树](#_lab2_2_1)

FSM(Finite State Machines) 有限状态机，也叫有限状态自动机，是为研究有限内存的计算过程和某些语言类而抽象出的一种计算模型，它拥有有限个数量的状态，每个状态可以迁移到零个或多个状态，输入字串决定执行哪个状态的迁移。

有限状态机有什么用
---------

代码编译器在工作时就需要通过词法分析、语法分析、语义分析来得到 AST(Abtract Syntaxt Tree) 抽象语法树。需要先词法分析拿到的所有 token 流，接着通过语法分析将 token 流进行文法校验生成语法解析树，这个过程一般有两种：

* 边分词边生成 AST，像解析 HTML、CSS
* 先分词生成所有 token，再来进行语法分析生成 AST，像 js

我们在前端工作中经常用到的：babel、typescript、eslint、postcss、prettier、uniapp、htmlparse、代码编辑器的语法高亮...这些其实都是基于 AST 抽象语法树来实现的，而为了得到 AST 我们需要先进行分词，而分词一个比较好的方式就是通过有限状态机来实现。

代码的本质就是字符串，分词就是把代码字符串变成一个个最小单元到不能再拆分的单词，也叫 token(注意不是咱们平时用到的登录态 token)，分词器的英文 tokenizer。代码其实跟我们一篇英文文章、一首中文古诗、一个数学运算...都是一样的，我们一样可以用分词技术来拆分这些元素。

有限状态机是怎么工作的
-----------

为了理解有限状态机到底是怎么工作的，我们先来实现一个简单的减法运算分词。要求用状态机把 500-250=250 这个减法运算分词成一个数组，首先定义一共有2种状态：number-数字、operator-运算符，每一个最小的 token 只能是这两个当中的一个，代码如下

```
// 500-250=250
// [
//   { type: 'number', value: '500' },
//   { type: 'operator', value: '-' },
//   { type: 'number', value: '250' },
//   { type: 'operator', value: '=' },
//   { type: 'number', value: '250' }
// ]
 
function mathTokenizer(text) {
  // 匹配数字正则
  const numberReg = /[0-9]/
  // 匹配运算符正则
  const operatorReg = /[-=]/
  // 存储所有读取到的 token 数组
  let tokens = []
  // 当前正在读取的 token 信息
  let currentToken = {}
 
  // 初始状态
  function init(e) {
    if (numberReg.test(e)) {
      currentToken = { type: 'number', value: e }
      return onNumber
    } else if (operatorReg.test(e)) {
      currentToken = { type: 'operator', value: e }
      return onOperator
    }
  }
 
  // 读取到数字
  function onNumber(e) {
    if (numberReg.test(e)) {
      currentToken.value += e
      return onNumber
    }
    if (operatorReg.test(e)) {
      pushToken(currentToken)
      currentToken = { type: 'operator', value: e }
      return onOperator
    }
  }
 
  // 读取到运算符
  function onOperator(e) {
    if (numberReg.test(e)) {
      pushToken(currentToken)
      currentToken = { type: 'number', value: e }
      return onNumber
    }
    if (operatorReg.test(e)) {
      pushToken(currentToken)
      currentToken = { type: 'operator', value: e }
      return onOperator
    }
  }
 
  // 每次读取到完整的一个 token 后存入到数组中
  function pushToken(token) {
    tokens.push(token)
    currentToken = {}
  }
 
  // 遍历读取数组
  function parse(str) {
    const len = str.length
    let stateMachine = init
    for (let i = 0; i < len; i++) {
      const char = str[i]
      stateMachine = stateMachine(char)
 
      // 最后一个字符匹配完了要自己 pushToken
      if (i === len - 1) {
        pushToken(currentToken)
      }
    }
 
    return tokens
  }
 
  return parse(text)
}
 
const arr = mathTokenizer('500-250=250')
console.log(arr)
```

[复制](javascript:;)

简版的 html 解析器
------------

### 词法分析，生成 token 流

利用状态机来生成 token 流，为了方便理解以下示例不考虑标签属性节点、自闭合标签和一些异常情况。

我们先定义5个状态：标签开始、结束标签开始、标签名、标签结束、文本，每次读取到的内容会在这5个状态之间切换，每次读取时只要不是标签开始、结束标签开始、标签名、标签结束这4个状态的我们都当成文本来处理。

实际上我们只需要存储：开始标签、文本、结束标签这3个状态，所以定义的节点 type 分别为：startTag、text、endTag。你要按前面定义的5个状态来储存其实也是可以的，在下面生成 AST 直接忽略掉我们不需要的标签开始、标签结束这些状态信息就行了，只不过这里我们直接在分词这一步提前就给过滤了。

这里我们可以把状态机理解成一个函数，每遍历到一个字符我们都将这个字符传到函数中，而函数中可以根据这个字符来判断下一个状态是什么，再返回出去下一个状态函数就行了。

```
function htmlTokenizer(str){
  // 标签开始
  const tagStartReg = /</
  // 结束标签开始
  const closeTagReg = ///
  // 标签结束
  const tagEndReg = />/
  // 标签名
  const tagNameReg = /[a-zA-Z]/
 
    let tokens = []
    let currentToken = {}
 
  // 初始状态
  function init(e) {
    if (tagStartReg.test(e)) {
      currentToken = { type: 'startTag', tagName: '' }
            return init
        }
    if (closeTagReg.test(e)) {
      currentToken = { type: 'endTag', tagName: '' }
            return onTagName
        }
    if (tagNameReg.test(e)) {
      currentToken.tagName += e
            return onTagName
        }
 
    // 不是上面3个状态的都当成文本节点处理
    currentToken = { type: 'text', text: e }
    return onText
  }
 
  // 读取到标签名
  function onTagName(e) {
    if (tagEndReg.test(e)) {
      pushToken(currentToken)
            return init
        } else {
      currentToken.tagName = (currentToken.tagName || '') + e
            return onTagName
        }
  }
 
  // 读取到文本
  function onText(e) {
    if (tagStartReg.test(e)) {
      pushToken(currentToken)
      currentToken = { type: 'startTag', tagName: '' }
            return init
        } else {
      currentToken.text = (currentToken.text || '') + e
            return onText
    }
  }
 
  // 每次读取到完整的一个 token 后存入到数组中
    function pushToken(e) {
        tokens.push(e)
        currentToken = {}
    }
 
  // 遍历读取数组
  function parse(chars){
    let stateMachine = init
        for (const char of chars) {
            stateMachine = stateMachine(char)
        }
        return tokens
    }
 
  return parse(str)
}
 
const tokenList = htmlTokenizer('<div>静夜思<p>锄禾日当午</p>周小黑<p>粒粒皆辛苦</p>公元一七八八年</div>')
console.log(tokenList)
```

[复制](javascript:;)

### 语法分析，生成 AST 抽象语法树

这一步主要就怎么能把分词得到的数组转换成树形 tree 数据结构，日常开发中我们 array 转 tree 一般都是需要根据父亲 id 之类的来实现遍历生成，但是这里咱拿到的数组是没有这个父 id 的，那要怎么实现呢？

先观察数据结构，虽然是一个数组，但是这个数组其实是个类似中心对称结构的，我们暂时先忽略掉数组里的 type 为 text 的文本内容(因为这个其实我们是不能把它当成一个父节点的，它只能是某个标签的子节点)，过滤掉文本后数组第1个元素和最后1个元素正好是1对，第2个元素和倒数第2个元素又是1对，我们要实现的就是把内层获取到的一对对标签不断挂载到它前面一对签的 children 属性上来实现 tree 结构。

那我们可以从数组第一项目开始遍历，然后用一个数组来模拟 stack 栈存每次遍历到的标签信息(栈的特点是先进后出，类似我们往一个桶里放东西，放在最上面的可以最先拿出来，规定数组只能使用 push 和 pop 就能模拟栈了)。

当遇到开始标签的时候就说明遇到一个新的标签了，这时就往栈里 push 进去，当遇到结束标签时就说明当前这个标签的所有信息都已经读取处理完了，那我们就可以将它从栈里弹出来，然后现在栈里最上面的一个元素其实就是当前弹出来的父标签了，直接挂载到 children 上就行了。整个过程其实主要就是理解下面2点：

* 用栈来缓存节点：嵌套在内部的节点就可以先出栈，根节点最后出栈
* 用引用类型对象的特点，来不断挂载节点

```
function htmlAst(tokenList) {
    let stack = []
 
  for (let i = 0; i < tokenList.length; i++) {
    const node = tokenList[i]
 
    // 开始标签：入栈
        if (node.type === 'startTag'){
            stack.push(node)
        }
 
    // 结束标签：出栈
        if (node.type === 'endTag') {
            const currentNode = stack.pop()
            const parent = stack[stack.length - 1]
 
            if (parent) {
                if (!parent.children) parent.children = []
        parent.children.push(currentNode)
            } else {
        const root = { type: 'document', children: [currentNode] }
                return root
            }
        }
 
    // 文本：加到父标签的 children 上
        if (node.type === 'text') {
            const parent = stack[stack.length - 1]
      if (!parent.children) parent.children = []
      parent.children.push(node)
        }
  }
}
```

[复制](javascript:;)

然后就能拿到我们需要的 AST 语法树了，结构如下：

```
{
  "type": "document",
  "children": [
    {
      "type": "startTag",
      "tagName": "div",
      "children": [
        {
          "type": "text",
          "text": "静夜思"
        },
        {
          "type": "startTag",
          "tagName": "p",
          "children": [
            {
              "type": "text",
              "text": "锄禾日当午"
            }
          ]
        },
        {
          "type": "text",
          "text": "周小黑"
        },
        {
          "type": "startTag",
          "tagName": "p",
          "children": [
            {
              "type": "text",
              "text": "粒粒皆辛苦"
            }
          ]
        },
        {
          "type": "text",
          "text": "公元一七八八年"
        }
      ]
    }
  ]
}
```

[复制](javascript:;)

理解了状态机就如给你按上了一双翅膀，不管给你任何一段字符任容，都可以通过状态机来拆分成我们想要的结构，理解了上面这些再去看 vue 里的模板编译，你就能知道它到底是怎么加进去那些语法糖的了。还比如小程序中的富文本解析，特定平台的小程序实际上是不能识别浏览器里的 html 的，那我们就需要先将 html 通过状态机转成 AST，然后再按照小程序的语法来进行特定的转换。

到此这篇关于使用有限状态机实现简版的html解析器的文章就介绍到这了,更多相关有限状态机实现html解析器内容请搜索脚本之家以前的文章或继续浏览下面的相关文章希望大家以后多多支持脚本之家！

**您可能感兴趣的文章:**

* [一文详解Go语言中的有限状态机FSM](/article/282307.htm "一文详解Go语言中的有限状态机FSM")
* [JS前端实现fsm有限状态机实例详解](/article/262064.htm "JS前端实现fsm有限状态机实例详解")
* [React使用有限状态机的实现示例](/article/248945.htm "React使用有限状态机的实现示例")
* [Java实现有限状态机的推荐方案分享](/article/229416.htm "Java实现有限状态机的推荐方案分享")
* [C++有限状态机实现详解](/article/224811.htm "C++有限状态机实现详解")

![](https://files.jb51.net/image/aijuli_logo.jpg)

问题没解决？试试这里

零距离AI可以帮你高效完成AI问答、AI对话、代码生成等开发相关的问题以及解决生活中遇到的各种疑难杂症，还能帮助你进行AI写作、AI绘画等等，提高你的工作学习效率。

[我要提问](https://www.aijuli.com/?user_sn=79693645)

![](https://files.jb51.net/skin/2018/images/jb51ewm.png)

微信公众号搜索 “ 脚本之家 ” ，选择关注

程序猿的那些事、送书等活动等着你

原文链接：<https://juejin.cn/post/7306416802837938176>

本文来自互联网用户投稿，该文观点仅代表作者本人，不代表本站立场。本站仅提供信息存储空间服务，不拥有所有权，不承担相关法律责任。
如若内容造成侵权/违法违规/事实不符，请将相关资料发送至 <reterry123@163.com> 进行投诉反馈，一经查实，立即处理！

* [有限状态机](//www.jb51.net/tag/%E6%9C%89%E9%99%90%E7%8A%B6%E6%80%81%E6%9C%BA/1.htm "搜索关于有限状态机的文章")
* [html](//www.jb51.net/tag/html/1.htm "搜索关于html的文章")
* [解析器](//www.jb51.net/tag/%E8%A7%A3%E6%9E%90%E5%99%A8/1.htm "搜索关于解析器的文章")

相关文章
----

* [![](https://img.jbzj.com/images/xgimg/bcimg0.png)
    ](/article/262509.htm "JS实现单例模式的N种方案")

    [JS实现单例模式的N种方案](/article/262509.htm "JS实现单例模式的N种方案")

    JS实现单例模式的多种方案 ，本文稍加总结，列出了6种方式与大家分享，大体上将内容分为了ES5（Function）与ES6（Class）实现两种部分，对js单例模式相关知识感兴趣的朋友跟随小编一起看看吧

    2022-09-09

* [![](https://img.jbzj.com/images/xgimg/bcimg1.png)
    ](/article/276085.htm "JavaScript中颜色模型的基础知识与应用详解")

    [JavaScript中颜色模型的基础知识与应用详解](/article/276085.htm "JavaScript中颜色模型的基础知识与应用详解")

    颜色模型，是用来表示颜色的数学模型。比如最常见的 RGB模型，使用 红绿蓝 三色来表示颜色。本文就来和大家讲讲JavaScript中颜色模型的基础知识与应用吧

    2023-02-02

* [![](https://img.jbzj.com/images/xgimg/bcimg2.png)
    ](/article/85625.htm "sencha ext js 6 快速入门(必看)")

    [sencha ext js 6 快速入门(必看)](/article/85625.htm "sencha ext js 6 快速入门(必看)")

    下面小编就为大家带来一篇sencha ext js 6 快速入门(必看)。小编觉得挺不错的，现在就分享给大家，也给大家做个参考。一起跟随小编过来看看吧

    2016-06-06

* [![](https://img.jbzj.com/images/xgimg/bcimg3.png)
    ](/article/71584.htm "js仿苹果iwatch外观的计时器代码分享")

    [js仿苹果iwatch外观的计时器代码分享](/article/71584.htm "js仿苹果iwatch外观的计时器代码分享")

    这篇文章主要介绍了JS+CSS3实现的类似于苹果iwatch计时器特效，很实用的代码，推荐给大家，有需要的小伙伴可以参考下。

    2015-08-08

* [![](https://img.jbzj.com/images/xgimg/bcimg4.png)
    ](/javascript/3131845bu.htm "基于JavaScript编写一个在线画板")

    [基于JavaScript编写一个在线画板](/javascript/3131845bu.htm "基于JavaScript编写一个在线画板")

    随着Web技术的发展,网页上的交互性变得越来越重要,一个在线画板是一个很好的例子,本文将使用HTML5的Canvas元素和JavaScript来实现一个简单的在线画板,需要的可以了解下

    2024-01-01

* [![](https://img.jbzj.com/images/xgimg/bcimg5.png)
    ](/article/170539.htm "NProgress显示顶部进度条效果及使用详解")

    [NProgress显示顶部进度条效果及使用详解](/article/170539.htm "NProgress显示顶部进度条效果及使用详解")

    这篇文章主要为大家详细介绍了NProgress显示顶部进度条效果及使用，具有一定的参考价值，感兴趣的小伙伴们可以参考一下

    2019-09-09

* [![](https://img.jbzj.com/images/xgimg/bcimg6.png)
    ](/article/64293.htm "深入分析Javascript跨域问题")

    [深入分析Javascript跨域问题](/article/64293.htm "深入分析Javascript跨域问题")

    JavaScript出于安全方面的考虑，不允许跨域调用其他页面的对象。但在安全限制的同时也给注入iframe或是ajax应用上带来了不少麻烦。这里把涉及到跨域的一些问题简单地整理一下

    2015-04-04

* [![](https://img.jbzj.com/images/xgimg/bcimg7.png)
    ](/article/155832.htm "JavaScript动态创建二维数组的方法示例")

    [JavaScript动态创建二维数组的方法示例](/article/155832.htm "JavaScript动态创建二维数组的方法示例")

    这篇文章主要介绍了JavaScript动态创建二维数组的方法,结合实例形式分析了javascript动态创建二维数组的相关操作技巧与注意事项,需要的朋友可以参考下

    2019-02-02

* [![](https://img.jbzj.com/images/xgimg/bcimg8.png)
    ](/article/37571.htm "js控制web打印(局部打印)方法整理")

    [js控制web打印(局部打印)方法整理](/article/37571.htm "js控制web打印(局部打印)方法整理")

    本文整理了一些常用的web打印及局部打印的方法以备不时之需，感兴趣的朋友可以学习下

    2013-05-05

* [![](https://img.jbzj.com/images/xgimg/bcimg9.png)
    ](/article/150023.htm "Bootstrap的aria-label和aria-labelledby属性实例详解")

    [Bootstrap的aria-label和aria-labelledby属性实例详解](/article/150023.htm "Bootstrap的aria-label和aria-labelledby属性实例详解")

    这篇文章主要介绍了Bootstrap的aria-label和aria-labelledby属性实例详解,需要的朋友可以参考下

    2018-11-11

[](#comments)

最新评论
----

[![](https://img.jbzj.com/image/hny300.gif)
广告　商业广告，理性选择](https://www.hncloud.com/activity/activity_2024spring.html/?p=jb51)

#### 大家感兴趣的内容

* _1_[JS删除数组里的某个元素方法](/article/134312.htm "JS删除数组里的某个元素方法")
* _2_[js刷新页面方法大全](/article/14397.htm "js刷新页面方法大全")
* _3_[JS中setTimeout()的用法详解](/article/35535.htm "JS中setTimeout()的用法详解")
* _4_[js页面跳转常用的几种方式](/article/25403.htm "js页面跳转常用的几种方式")
* _5_[JS截取字符串常用方法详细整理](/article/42482.htm "JS截取字符串常用方法详细整理")
* _6_[js保留两位小数方法总结](/article/134067.htm "js保留两位小数方法总结")
* _7_[js数组与字符串的相互转换方法](/article/52038.htm "js数组与字符串的相互转换方法")
* _8_[JS设置cookie、读取cookie、删除cookie](/article/64330.htm "JS设置cookie、读取cookie、删除cookie")
* _9_[JS打开新窗口的2种方式](/article/35691.htm "JS打开新窗口的2种方式")
* _10_[js 将json字符串转换为json对象的方法解析](/article/43136.htm "js 将json字符串转换为json对象的方法解析")

[![](https://files.jb51.net/image/henghost300.png?1229)
广告　商业广告，理性选择](https://www.henghost.com/act/2021newyear.html?jbzj)

[![](https://files.jb51.net/image/99idc300.jpg)
广告　商业广告，理性选择](https://www.580dns.com/)

[![](https://files.jb51.net/image/wh300.png)
广告　商业广告，理性选择](https://shop294553060.taobao.com/?spm=pc_detail.27183998/evo365560b447259.202202.2.5ce97dd62B8MqR)

[![](https://files.jb51.net/image/qkidc300.png)
广告　商业广告，理性选择](https://www.qkidc.com/)

#### 最近更新的内容

* [Javascript中的every()与some()的区别和应用小结](/article/283922.htm "Javascript中的every()与some()的区别和应用小结")
* [JS从一组数据中找到指定的单条数据的方法](/article/85672.htm "JS从一组数据中找到指定的单条数据的方法")
* [JS创建或填充任意长度数组的小技巧汇总](/article/226153.htm "JS创建或填充任意长度数组的小技巧汇总")
* [利用js制作html table分页示例(js实现分页)](/article/49373.htm "利用js制作html table分页示例(js实现分页)")
* [基于javascript显示当前时间以及倒计时功能](/article/81159.htm "基于javascript显示当前时间以及倒计时功能")
* [javascript 进度条的几种方法](/article/18339.htm "javascript 进度条的几种方法")
* [JS获取日期的方法实例【昨天,今天,明天,前n天,后n天的日期】](/article/124795.htm "JS获取日期的方法实例【昨天,今天,明天,前n天,后n天的日期】")
* [浅谈JS中小数相加不精确的原因](/article/280739.htm "浅谈JS中小数相加不精确的原因")
* [javascript 10进制和62进制的相互转换](/article/53061.htm "javascript 10进制和62进制的相互转换")
* [javascript,jquery闭包概念分析](/article/23932.htm "javascript,jquery闭包概念分析")

[

在线工具
====

代码格式化等](<http://tools.jb51.net)[>

高防主机
====

600G 防护](<https://www.jb51.net/s/idc/)[>

枫信科技
====

IDC服务商](<http://www.33ip.com>)

#### 常用在线小工具

* [CSS代码工具](http://tools.jb51.net/code/css)
* [JavaScript代码格式化工具](http://tools.jb51.net/code/js)
* [在线XML格式化/压缩工具](http://tools.jb51.net/code/xmlformat)
* [php代码在线格式化美化工具](http://tools.jb51.net/code/phpformat)
* [sql代码在线格式化美化工具](http://tools.jb51.net/code/sqlcodeformat)
* [在线HTML转义/反转义工具](http://tools.jb51.net/transcoding/html_transcode)
* [在线JSON代码检验/检验/美化/格式化](http://tools.jb51.net/code/json)
* [JavaScript正则在线测试工具](http://tools.jb51.net/regex/javascript)
* [在线生成二维码工具(加强版)](http://tools.jb51.net/transcoding/jb51qrcode)
* [更多在线工具](http://tools.jb51.net/)

[![](https://files.jb51.net/image/tengyou300.gif?1209)
广告　商业广告，理性选择](http://www.tuidc.com/indexhd.html)

[![](https://files.jb51.net/image/yyqz300.gif)
广告　商业广告，理性选择](https://www.yiyangidc.com/)

[![](https://files.jb51.net/image/bly300.jpg)
广告　商业广告，理性选择](http://www.boluoyun.com/)

目录

* 有限状态机有什么用

* 有限状态机是怎么工作的

* 简版的 html 解析器

  * 词法分析，生成 token 流

  * 语法分析，生成 AST 抽象语法树

[关于我们](/about.htm) \- [广告合作](/support.htm) \- [联系我们](/linkus.htm) \- [免责声明](/sm.htm) \- [网站地图](/sitemap.htm) \- [投诉建议](tencent://message/?uin=461478385&Site=https://www.jb51.net) \- [在线投稿](/up.htm)

©CopyRight 2006-2024 JB51.Net Inc All Rights Reserved. 脚本之家 版权所有
