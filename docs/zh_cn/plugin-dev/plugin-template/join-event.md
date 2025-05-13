# 编写事件处理器
事件处理器是插件的主要功能之一。它们允许插件接入服务器的内部工作并改变其行为，以执行其他操作。作为一个简单的例子，我们将实现一个`player_join`事件的处理器。

Pumpkin 插件事件系统尝试复制Bukkit/Spigot事件系统，以便来自那里的开发者能更容易地学习 Pumpkin 。
然而，Rust有不同的概念和规则，所以并非所有内容都像在Bukkit/Spigot中一样。
Rust没有继承；它只有组合。

事件系统使用特质（traits）来动态处理一些事件：`Event`、`Cancellable`、`PlayerEvent`等。
Cancellable也可以是Event，因为它是一个特质。（待确认）

## 实现加入事件
单个事件处理器只是实现了`EventHandler<T>`特质的结构体（其中`T`是特定的事件实现）。

### 什么是阻塞事件？
 Pumpkin 插件事件系统区分两种类型的事件：阻塞和非阻塞。每种都有其优势：
#### 阻塞事件
```diff
优点：
+ 可以修改事件（如编辑加入消息）
+ 可以取消事件
+ 有优先级系统
缺点：
- 按顺序执行
- 如果实现不好可能会减慢服务器速度
```
#### 非阻塞事件
```diff
优点：
+ 并发执行
+ 在所有阻塞事件完成后执行
+ 仍然可以进行一些修改（任何在Mutex或RwLock后面的内容）
缺点：
- 无法取消事件
- 没有优先级系统
- 对事件的控制较少
```

### 编写处理器
由于我们的主要目标是更改玩家加入服务器时看到的欢迎消息，我们将选择具有低优先级的阻塞事件类型。

在`on_load`方法上方添加以下代码：
:::code-group
```rs [lib.rs]
use async_trait::async_trait; // [!code ++:4]
use pumpkin_api_macros::with_runtime;
use pumpkin::plugin::{player::PlayerJoinEvent, Context, EventHandler};
use pumpkin_util::text::{color::NamedColor, TextComponent};

struct MyJoinHandler; // [!code ++:12]

#[with_runtime(global)]
#[async_trait]
impl EventHandler<PlayerJoinEvent> for MyJoinHandler {
    async fn handle_blocking(&self, event: &mut PlayerJoinEvent) {
        event.join_message =
            TextComponent::text(format!("欢迎，{}！", event.player.gameprofile.name))
                .color_named(NamedColor::Green);
    }
}
```
:::

**解释**：
- `struct MyJoinHandler;`：我们事件处理器的结构体
- `#[with_runtime(global)]`： Pumpkin 使用 tokio 异步运行时，它在插件边界上会有奇怪的行为。虽然在这个特定例子中不是必需的，但最好用这个宏包装所有与异步代码交互的异步`impl`。
- `#[async_trait]`：Rust对具有异步方法的特质没有完全支持。因此，我们使用`async_trait`包来实现这一点。
- `async fn handle_blocking()`：由于我们选择将此事件设为阻塞，需要实现`handle_blocking()`方法而不是`handle()`方法。

::: warning 重要
`#[with_runtime(global)]`宏必须位于`#[async_trait]`宏**上方**。如果它们顺序相反，`#[with_runtime(global)]`宏可能不起作用。
:::

### 注册处理器
现在我们已经编写了事件处理器，我们需要告诉插件使用它。我们可以通过在`on_load`方法中添加一行代码来实现：
:::code-group
```rs [lib.rs]
use pumpkin::plugin::{player::PlayerJoinEvent, Context, EventHandler, EventPriority}; // [!code ++]
use pumpkin::plugin::{player::PlayerJoinEvent, Context, EventHandler}; // [!code --]

#[plugin_method]
async fn on_load(&mut self, server: &Context) -> Result<(), String> {
    pumpkin::init_log!();

    log::info!("你好， Pumpkin ！");

    server.register_event(Arc::new(MyJoinHandler), EventPriority::Lowest, true).await; // [!code ++]

    Ok(())
}
```
:::
现在如果我们构建插件并加入服务器，我们应该能看到一个绿色的带有我们用户名的"欢迎"消息！ 