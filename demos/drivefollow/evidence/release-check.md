# 技术实现与质量验证

## 运行方式
网页可直接打开，无需登录。交互演示使用示例数据，操作在当前浏览器保存；报价核实、联系和预约以演示方式运行。

## 工程验证
| 项目 | 行为测试 | 主要覆盖 |
| --- | --- | --- |
| DriveFollow | 69 项 | 询价、许可、知识时效、任务状态、撤回、恢复与服务接口 |
| 个人作品站 | 18 项 | 内容结构、导航、子路径和交互入口 |
| DrivePulse | 16 项 | 人群筛选、资格、审核与反馈 |
| DriveReach | 32 项 | 对话字段、任务、SQLite 与服务边界 |
| LoopLab | 16 项 | 样本隔离、统计、地址与裁决 |

## 操作检查
桌面与手机布局、连续询价、内部核价、限定渠道许可、关系检查、重复确认、撤回取消、刷新恢复和记录导出均有检查记录。专业作品集网页与 PDF 使用同一内容源，保留可点击的项目入口。

## 技术入口
- [DriveFollow 源码与测试](https://github.com/Sienna-cat/drivefollow)
- [个人作品站](https://sienna-cat.github.io/sienna-earth-online/)
- [专业作品集与 PDF](https://sienna-cat.github.io/drivefollow/portfolio/)
