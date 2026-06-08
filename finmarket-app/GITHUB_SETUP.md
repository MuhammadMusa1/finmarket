# Заливка в GitHub и запуск на другом ноутбуке

## На этом (домашнем) ноутбуке — залить в GitHub

```bash
cd finmarket-app
git init
git add .
git commit -m "FinMarket TJ MVP"
# создай пустой репозиторий на github.com, затем:
git remote add origin https://github.com/ТВОЙ_ЛОГИН/finmarket-tj.git
git branch -M main
git push -u origin main
```

## На корпоративном ноутбуке — склонировать и запустить

```bash
git clone https://github.com/ТВОЙ_ЛОГИН/finmarket-tj.git
cd finmarket-tj
npm install
npm run setup
npm run dev
```

Открыть http://localhost:3000

Требуется только Node.js 20+. Никаких Docker/PostgreSQL/RabbitMQ.
