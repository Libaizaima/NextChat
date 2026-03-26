# NextChat 私有部署文档

## 服务器信息

- **系统**: Ubuntu (192.168.1.100)
- **部署路径**: `/opt/NextChat`
- **运行端口**: 3000
- **进程管理**: systemd
- **Node.js**: v22.22.0 (nvm)

## 服务管理

NextChat 使用 systemd 管理，服务名称为 `nextchat`。

```bash
# 查看状态
sudo systemctl status nextchat

# 重启服务
sudo systemctl restart nextchat

# 停止服务
sudo systemctl stop nextchat

# 启动服务
sudo systemctl start nextchat

# 查看实时日志
sudo journalctl -u nextchat -f

# 查看最近 100 行日志
sudo journalctl -u nextchat -n 100
```

### systemd 配置文件

路径: `/etc/systemd/system/nextchat.service`

```ini
[Unit]
Description=NextChat Web Application
After=network.target

[Service]
Type=simple
User=shuai
Group=shuai
WorkingDirectory=/opt/NextChat
Environment=NODE_ENV=production
Environment=PORT=3000
Environment=PATH=/home/shuai/.nvm/versions/node/v22.22.0/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
EnvironmentFile=/opt/NextChat/.env.local
ExecStart=/home/shuai/.nvm/versions/node/v22.22.0/bin/npm start
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

> **注意**: 修改 `.env.local` 后需要重启服务才能生效。

## 环境变量

配置文件: `/opt/NextChat/.env.local`

| 变量 | 说明 | 当前值 |
|------|------|--------|
| `BASE_URL` | API 中转地址 | `https://cliproxy.zaima.cloud` |
| `OPENAI_API_KEY` | API Key | （已配置） |
| `CODE` | 访问密码 | （已配置） |
| `HIDE_USER_API_KEY` | 隐藏用户 Key 输入框 | `1` |
| `CUSTOM_MODELS` | 自定义模型列表 | 仅显示 gpt-5 系列 |
| `DEFAULT_MODEL` | 默认模型 | `gpt-5.4` |

## CI/CD 自动部署

通过 GitHub Actions 实现推送 `main` 分支后自动部署。

**工作流文件**: `.github/workflows/deploy.yml`

```yaml
# 推送到 main 分支 → SSH 到服务器 → 拉代码 → 构建 → 重启
git pull → yarn install → yarn build → sudo systemctl restart nextchat
```

### GitHub Secrets 配置

| Secret | 说明 |
|--------|------|
| `SERVER_HOST` | 服务器地址 |
| `SERVER_USER` | SSH 用户名 |
| `SERVER_KEY` | SSH 私钥 |

> **注意**: deploy.yml 中使用 `sudo systemctl restart nextchat`，请确保 SSH 用户有免密 sudo 权限执行该命令。

## 手动部署/更新

```bash
ssh shuai@192.168.1.100
cd /opt/NextChat
git pull origin main
yarn install --frozen-lockfile
yarn build
sudo systemctl restart nextchat
```

## 故障排查

```bash
# 1. 检查服务状态
sudo systemctl status nextchat

# 2. 查看错误日志
sudo journalctl -u nextchat -n 50 --no-pager

# 3. 检查端口
ss -tlnp | grep :3000

# 4. 检查 Node.js 环境
/home/shuai/.nvm/versions/node/v22.22.0/bin/node -v
```

## 与其他服务的关系

| 服务 | 管理方式 | 说明 |
|------|----------|------|
| **NextChat** | systemd | 本项目，端口 3000 |
| **Nginx** | systemd | 反向代理 |
| **FRP Client** | systemd | 内网穿透 |
| **Docker 容器** | docker compose | cli-proxy, waoowaoo 等 |
