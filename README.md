# 哔轻反屏蔽解锁

去掉哔哩轻小说移动版的「呜呜～是广告屏蔽器!!」弹窗，并恢复被锁住的页面滚动。开着去广告插件也能往下读，不用把网站加入白名单。

覆盖域名：`linovelib.com`、`bilinovel.com`、`bilinovel.net`、`bilinovel.org`、`bilinovel.de`、`bilinovel.co.uk` 及其子域名。

这个扩展没有工具栏图标。装好并刷新章节页之后，弹窗不再出现、页面可以滑动，就是安装成功。

仓库里已经带好构建结果，日常安装不用装 Node.js：

- 扩展本体在仓库根目录（`manifest.json`、`src/`）
- 油猴脚本在 [dist/bilinovel-unlock.user.js](dist/bilinovel-unlock.user.js)
- 备用过滤规则在 [filters/ubo-adguard.txt](filters/ubo-adguard.txt)

三种用法里，电脑用扩展，手机用油猴脚本。过滤规则是不装插件时的备用，去不掉检测本身。

## 这个问题

手机 Edge 打开移动版章节时，去广告插件会被认出来。每进一页都弹出下面的窗口，挡在正文上面。

倒计时没结束时，右上角是剩余秒数，关不掉：

![倒计时中的反屏蔽弹窗，右上角是数字 3](docs/popup-countdown.jpg)

大约五秒后，数字才会换成关闭按钮：

![倒计时结束后的反屏蔽弹窗，右上角是关闭按钮](docs/popup-close.jpg)

不点关闭，页面上的滚动锁不会解开，后面的正文滑不动。只把这个弹窗当成广告藏起来也一样，锁还在。

## 从 GitHub 拿到项目

任选一种。

**用 Git：**

```bash
git clone https://github.com/Max919-star/bilinovel-unlock.git
cd bilinovel-unlock
```

**不用 Git：** 打开仓库页面，点绿色的 **Code**，再点 **Download ZIP**。解压后进入那个文件夹，确认这一层能直接看到 `manifest.json`，而不是还要再进一层。

改过 `src/` 里的代码才需要重新构建。构建需要 Node.js 18 或更高版本：

```bash
node scripts/build.mjs
```

也可以运行 `npm run build`。构建会覆盖 `dist/bilinovel-unlock.user.js` 和 `dist/bilinovel-unlock.zip`。

## 安装

### 电脑 Edge：加载扩展

在电脑上阅读，或想先在电脑上确认扩展可用时，用这种方式。加载的是仓库根目录，不是 `dist` 里的 zip。

1. 打开 Edge，地址栏输入 `edge://extensions` 后回车。
2. 打开左下角的 **开发人员模式**。
3. 点 **加载解压缩的扩展**。
4. 选中含有 `manifest.json` 的那一层目录：
   - 用 Git 克隆的，就是克隆出来的仓库根目录。
   - 用 Download ZIP 的，就是解压后能直接看到 `manifest.json` 的那个文件夹。
5. 列表里出现 **哔轻反屏蔽解锁**，开关是打开的。这一项没有浏览器按钮，工具栏上不会多出一个图标。
6. 用手机模式打开任意章节页做确认：按 `F12` 打开开发者工具，点 **切换设备仿真**（手机和平板图标），选择一款手机，再打开章节。弹窗不再出现，页面向下滚动后正文继续出来，即安装成功。电脑版普通窗口本身就不会弹这个窗，所以必须开设备仿真，或者直接到手机上确认。

以后更新：

1. 在仓库目录执行 `git pull`，或重新下载 ZIP 并解压覆盖。
2. 回到 `edge://extensions`，在这张卡片上点 **重新加载**。
3. 刷新已经打开的章节页。

卸掉：在同一张卡片上点 **移除**。

装不上时先看这几项：

| 现象 | 处理 |
| --- | --- |
| 选择目录后提示找不到清单文件 | 选高了一层或选进了 `src`、`dist`。改选能直接看到 `manifest.json` 的那一层。 |
| 没有「加载解压缩的扩展」 | 开发人员模式没有打开。 |
| 扩展在列表里，章节页仍弹窗 | 卡片上的开关是关的，或页面是安装前留下的。打开开关后刷新章节页。 |

### 手机 Edge：安装油猴脚本

手机 Edge 正式版不能加载自己写的扩展，用 Tampermonkey 跑仓库里的油猴脚本。脚本和扩展是同一套逻辑。

先在手机上装 Tampermonkey：

1. 用 Google Play 把 Microsoft Edge 更新到最新版。
2. 打开 Edge，点右下角 **☰** 菜单，点 **扩展**。
3. 在扩展商店里搜索 **Tampermonkey**，点 **获取**，按提示安装。列表里如果已经有 Violentmonkey 或 ScriptCat，也可以用它们安装下面同一个脚本，不必再装一个管理器。
4. 回到 **☰ → 扩展**，确认 Tampermonkey 已启用。

再安装脚本。用手机 Edge 打开脚本的原始文件地址：

```text
https://github.com/Max919-star/bilinovel-unlock/raw/main/dist/bilinovel-unlock.user.js
```

1. 页面跳到 Tampermonkey 的安装确认页，能看到脚本名 **哔轻反屏蔽解锁**。
2. 点 **安装**。
3. 打开任意章节页并下拉刷新。弹窗不再出现，并且可以连续往下滑动，即安装成功。

打开上面的地址后如果只显示源代码、没有安装页：

1. 全选并复制页面上的全部代码。
2. 点 **☰ → 扩展 → Tampermonkey**，进入仪表盘。
3. 点 **添加新脚本**，清空编辑器里的模板，粘贴刚才复制的内容。
4. 点 **文件 → 保存**（或编辑器里的保存图标）。
5. 在已安装脚本列表里确认 **哔轻反屏蔽解锁** 是启用状态，然后刷新章节页。

手机暂时打不开 GitHub 时，在电脑上打开仓库里的 `dist/bilinovel-unlock.user.js`，把这个文件发到手机（微信、网盘、数据线都可以）。手机 Edge 打开该文件，出现安装页就点安装；只显示代码就按上面的「复制 → 添加新脚本」处理。

以后更新：用手机 Edge 重新打开那条 `raw` 地址，Tampermonkey 会提示更新，点更新后刷新章节页。

卸掉：打开 Tampermonkey 仪表盘，在该脚本上点删除。

仍会弹窗时逐项看：

- 脚本在 Tampermonkey 列表里是启用的，Tampermonkey 自己在 Edge 的扩展列表里也是启用的。
- 安装之后刷新过章节页，不是停在安装前的旧页面上。
- 打开的是移动版章节页。桌面版页面本来就没有这个弹窗。
- 地址在脚本支持的域名里：`linovelib.com`、`bilinovel.com`、`bilinovel.net`、`bilinovel.org`、`bilinovel.de`、`bilinovel.co.uk`。

### 备用：只粘贴过滤规则

不装扩展、也不装油猴时，可以把规则贴进 uBlock Origin 或 AdGuard。这组规则只隐藏弹窗并解开滚动锁，网站的检测脚本仍会运行。

在电脑上：

1. 打开 [filters/ubo-adguard.txt](filters/ubo-adguard.txt)，复制「uBlock Origin 与 AdGuard」那一段里没有被 `!` 注释掉的规则。`!` 开头的是说明，可以一起复制，过滤引擎会忽略它们。
2. **uBlock Origin**：点工具栏图标，点仪表盘图标，打开 **我的过滤器**，粘贴到末尾，点 **应用更改**。
3. **AdGuard**：打开设置里的 **用户规则**（或「过滤器 → 自定义」），粘贴后保存。AdGuard 不认识上面的 `##+js` 行，改用文件里「仅 AdGuard」那一节被注释掉的 `//scriptlet` 那一行，去掉行首的 `! ` 再保存。元素隐藏和 `:style` 规则两边通用，不用贴第二遍。
4. 刷新章节页。

**Adblock Plus** 不支持这些规则里的 `:style` 和 scriptlet。它只能藏起弹窗，滚动锁还在，页面仍然滑不动。文件末尾有单独的 ABP 片段和说明。遇到这种情况就改用上面的扩展或油猴脚本。

手机 Edge 里，不少扩展打不开自己的设置页，自定义规则经常加不进去。手机请用上一节的油猴脚本。

## 这个弹窗是怎么来的

手机版 Edge 会被分到移动版模板，章节页额外加载 `/themes/zhmb/js/readtools.js`。这段混淆脚本做两件事：

- 监听 `window` 上的 `error` 事件，广告脚本（`adsbygoogle.js`）加载失败就判定开了屏蔽器。
- 延迟检查页面上的 `ins.adsbygoogle` 广告位，发现是空的同样判定。

判定成立后它插入 `#adblock-dialog` 弹窗（5 秒倒计时），并给 `body` 加上 `no-scroll` 类。滚动锁来自 `/public/mesp.css` 里的 `body.no-scroll { overflow: hidden !important }`，只有点关闭按钮才会移除这个类。所以只把弹窗元素当广告屏蔽掉，滚动锁还在，页面就滑不动。

电脑版模板不加载这段脚本，所以电脑上没有这个弹窗。

## 插件怎么解决

分三层，互为备份：

1. `src/main-world.js` 在页面脚本运行前执行：移除 `ins.adsbygoogle` 广告位，并让广告脚本的加载失败错误传不到 `window` 的监听器。检测条件都不成立，弹窗和滚动锁从一开始就不会出现。
2. `src/unlock.css` 强制隐藏弹窗，并用更高特异性的选择器压过 `no-scroll` 的滚动锁，同时保证正文容器不被 `display: none` 掉。
3. `src/guard.js` 兜底：万一检测还是触发了，它会隐藏弹窗、去掉 `body` 的 `no-scroll`、恢复被隐藏的正文。

## 本地验证

真实站点在自动化访问时被 Cloudflare 拦截，所以验证用的是 `test/serve.mjs`：它用存档下来的真实反屏蔽脚本搭了一个本地章节页，广告脚本固定返回 404，复现开了去广告插件后的情形。

```bash
npm install
node test/serve.mjs
node test/run.mjs            # 完整三层
node test/run.mjs fallback   # 只保留 CSS 和兜底层，确认检测触发后仍可滚动
```

`test/run.mjs` 用本机 Edge（无头、手机视口）打开测试页，在文档开始解析前注入构建好的 `dist/bilinovel-unlock.user.js`，等检测脚本的延迟检查跑完后断言：弹窗不可见、`body` 没有 `no-scroll`、页面向下滚动生效、正文还在。先启动 `test/serve.mjs`，再另开一个终端跑 `test/run.mjs`。

`research/` 里是本地保存的站点脚本和章节页，含小说正文，没有放进仓库。没有这批文件时，扩展和油猴脚本照常可用，只有本地复现测试跑不起来。
