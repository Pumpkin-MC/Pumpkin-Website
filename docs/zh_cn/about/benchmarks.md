# 性能基准测试

这里将 Pumpkin 与常见的 Minecraft 服务器软件进行比较。

> [!CAUTION]
> **这个比较并不完全公平。** Pumpkin 目前的功能远少于其他服务器，这可能意味着它使用的资源更少。
> 同时也要考虑到其他服务器已经有多年的优化经验。
> 原版分支不需要重写整个原版逻辑，可以专注于优化。

![Screenshot From 2024-10-15 16-42-53](https://github.com/user-attachments/assets/e08fbb00-42fe-4479-a03b-11bb6886c91a)

## 规格

#### 技术规格

**软件**

- 发行版：Manjaro Linux
- 架构：x86_64 (64位)
- 内核版本：6.11.3-arch1-1

**硬件**

- 主板：MAG B650 TOMAHAWK WIFI
- CPU：AMD Ryzen 7600X 6核
- 内存：Corsair 2x16GB DDR5 6000Mhz
- 存储：Samsung 990 PRO 1TB PCIe 4.0 M.2 SSD
- 散热：be quiet Dark Rock Elite

**Rust**

- 工具链：stable-x86_64-unknown-linux-gnu (1.81.0)
- Rust 编译器：rustc 1.81.0 (eeb90cda1 2024-09-04)

**Java**

- JDK 版本：OpenJDK 23 64位 2024-09-17
- JRE 版本：OpenJDK Runtime Environment (build 23+37)
- 供应商：Oracle

#### 游戏设置

- Minecraft 版本：1.21.1
- 视距：10
- 模拟距离：10
- 在线模式：false
- Rcon：false

<sub><sup>为了使用非正版账号进行更容易的测试，禁用了在线模式。</sup></sub>

> [!NOTE]
> 所有测试都进行了多次以获得更准确的结果。
> 所有玩家在生成时都没有移动。只加载了初始的8个区块。
> 所有服务器都使用了各自的地形生成。没有预加载世界。

> [!IMPORTANT]
> 单个玩家时 `CPU 最大值` 通常更高，因为初始区块正在被加载。

## Pumpkin

构建版本：[8febc50](https://github.com/Snowiiii/Pumpkin/commit/8febc5035d5611558c13505b7724e6ca284e0ada)

编译参数：`--release`

运行参数：

**文件大小：** <FmtNum :n=12.3 />MB

**启动时间：** <FmtNum :n=8 />ms

**关闭时间：** <FmtNum :n=0 />ms

| 玩家数 | 内存                  | CPU 空闲         | CPU 最大值         |
| ------ | --------------------- | ---------------- | ------------------ |
| 0      | <FmtNum :n=392.2 />KB | <FmtNum :n=0 />% | <FmtNum :n=0 />%   |
| 1      | <FmtNum :n=24.9 />MB  | <FmtNum :n=0 />% | <FmtNum :n=4 />%   |
| 2      | <FmtNum :n=25.1 />MB  | <FmtNum :n=0 />% | <FmtNum :n=0.6 />% |
| 5      | <FmtNum :n=26 />MB    | <FmtNum :n=0 />% | <FmtNum :n=1 />%   |
| 10     | <FmtNum :n=27.1 />MB  | <FmtNum :n=0 />% | <FmtNum :n=1.5 />% |

<sub><sup>Pumpkin 会缓存已加载的区块，除了玩家数据外不会使用额外的内存，且 CPU 使用率最小。</sup></sub>

#### 编译时间
从零开始编译：

**调试模式：** <FmtNum :n=10.35 />秒
**发布模式：** <FmtNum :n=38.40 />秒

重新编译 (pumpkin crate)：

**调试模式：** <FmtNum :n=1.82 />秒
**发布模式：** <FmtNum :n=28.68 />秒

## 原版 (Vanilla)

发布版本：[1.21.1](https://piston-data.mojang.com/v1/objects/59353fb40c36d304f2035d51e7d6e6baa98dc05c/server.jar)

编译参数：

运行参数：`nogui`

**文件大小：** <FmtNum :n=51.6 />MB

**启动时间：** <FmtNum :n=7 />秒

**关闭时间：** <FmtNum :n=4 />秒

| 玩家数 | 内存                 | CPU 空闲                                | CPU 最大值         |
| ------ | -------------------- | --------------------------------------- | ------------------ |
| 0      | <FmtNum n="860" />MB | <FmtNum n="0.1" /> - <FmtNum n="0.3" />% | <FmtNum n="51" />% |
| 1      | <FmtNum n="1.5" />GB | <FmtNum n="0.9" /> - <FmtNum n="1" />%   | <FmtNum n="41" />% |
| 2      | <FmtNum n="1.6" />GB | <FmtNum n="1" /> - <FmtNum n="1.1" />%   | <FmtNum n="10" />% |
| 5      | <FmtNum n="1.8" />GB | <FmtNum n="2" />%                        | <FmtNum n="20" />% |
| 10     | <FmtNum n="2.2" />GB | <FmtNum n="4" />%                        | <FmtNum n="24" />% |

## Paper

构建版本：[122](https://api.papermc.io/v2/projects/paper/versions/1.21.1/builds/122/downloads/paper-1.21.1-122.jar)

编译参数：

运行参数：`nogui`

**文件大小：** <FmtNum :n=49.4 />MB

**启动时间：** <FmtNum :n=7 />秒

**关闭时间：** <FmtNum :n=3 />秒

| 玩家数 | 内存                | CPU 空闲                               | CPU 最大值        |
| ------ | ------------------- | -------------------------------------- | ----------------- |
| 0      | <FmtNum :n=1.1 />GB | <FmtNum :n=0.2 /> - <FmtNum :n=0.3 />% | <FmtNum :n=36 />% |
| 1      | <FmtNum :n=1.7 />GB | <FmtNum :n=0.9 /> - <FmtNum :n=1.0 />% | <FmtNum :n=47 />% |
| 2      | <FmtNum :n=1.8 />GB | <FmtNum :n=1 /> - <FmtNum :n=1.1 />%   | <FmtNum :n=10 />% |
| 5      | <FmtNum :n=1.9 />GB | <FmtNum :n=1.5 />%                     | <FmtNum :n=15 />% |
| 10     | <FmtNum :n=2 />GB   | <FmtNum :n=3 />%                       | <FmtNum :n=20 />% |


## Purpur

构建版本：[2324](https://api.purpurmc.org/v2/purpur/1.21.1/2324/download)

编译参数：

运行参数：`nogui`

**文件大小：** <FmtNum :n=53.1 />MB

**启动时间：** <FmtNum :n=8 />秒

**关闭时间：** <FmtNum :n=4 />秒

| 玩家数 | 内存                | CPU 空闲                               | CPU 最大值        |
| ------ | ------------------- | -------------------------------------- | ----------------- |
| 0      | <FmtNum :n=1.4 />GB | <FmtNum :n=0.2 /> - <FmtNum :n=0.3 />% | <FmtNum :n=25 />% |
| 1      | <FmtNum :n=1.6 />GB | <FmtNum :n=0.7 /> - <FmtNum :n=1.0 />% | <FmtNum :n=35 />% |
| 2      | <FmtNum :n=1.7 />GB | <FmtNum :n=1.1 /> - <FmtNum :n=1.3 />% | <FmtNum :n=9 />%  |
| 5      | <FmtNum :n=1.9 />GB | <FmtNum :n=1.6 />%                     | <FmtNum :n=20 />% |
| 10     | <FmtNum :n=2.2 />GB | <FmtNum :n=2 /> - <FmtNum :n=2.5 />%   | <FmtNum :n=26 />% |

## Minestom

提交版本：[0ca1dda2fe](https://github.com/Minestom/Minestom/commit/0ca1dda2fe11390a1b89a228bbe7bf78fefc73e1)

编译参数：

运行参数：

**语言：** 使用 Kotlin 2.0.0 运行基准测试（Minestom 本身使用 Java 开发）

**文件大小：** <FmtNum :n=2.8 />MB（库）

**启动时间：** <FmtNum :n=310 />ms

**关闭时间：** <FmtNum :n=0 />ms

<sub>[示例代码来源](https://minestom.net/docs/setup/your-first-server)</sub>

| 玩家数 | 内存                | CPU 空闲                               | CPU 最大值       |
| ------ | ------------------- | -------------------------------------- | ---------------- |
| 0      | <FmtNum :n=228 />MB | <FmtNum :n=0.1 /> - <FmtNum :n=0.3 />% | <FmtNum :n=1 />% |
| 1      | <FmtNum :n=365 />MB | <FmtNum :n=0.9 /> - <FmtNum :n=1.0 />% | <FmtNum :n=5 />% |
| 2      | <FmtNum :n=371 />MB | <FmtNum :n=1 /> - <FmtNum :n=1.1 />%   | <FmtNum :n=4 />% |
| 5      | <FmtNum :n=390 />MB | <FmtNum :n=1.0 />%                     | <FmtNum :n=6 />% |
| 10     | <FmtNum :n=421 />MB | <FmtNum :n=3 />%                       | <FmtNum :n=9 />% |


基准测试时间 <FmtDateTime :d="new Date('2024-10-15T16:34Z')" /> 