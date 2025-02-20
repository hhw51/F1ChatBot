# 🏎️ F1 Chatbot - Formula 1 AI Assistant

Welcome to the **F1 Chatbot**, an **AI-powered assistant** designed to provide **real-time Formula 1 insights**!  
Built with **Next.js, Claude AI, AstraDB, and Web Scraping**, this chatbot delivers the **latest race results, driver standings, and championship updates**.

---

## 🚀 Live Demo
[Coming Soon]  

📌 **Repository**: [GitHub Repo](https://https://github.com/hhw51/F1ChatBot)

---

## 📌 Features
✅ **Real-time F1 Updates** via Web Scraping  
✅ **AI-Powered Responses** using Claude API  
✅ **Persistent Chat History** stored in AstraDB  
✅ **Interactive UI** built with Next.js 15  
✅ **Auto-Scrolling & Typing Animation**  
✅ **Deployed on Vercel** for scalability  

---

## 🛠️ Tech Stack

| **Technology**  | **Purpose** |
|----------------|------------|
| **Next.js 15.1.7** | Frontend & API Routes |
| **TypeScript** | Type safety & development efficiency |
| **Claude API** | AI-powered F1 chatbot responses |
| **AstraDB (Vector DB)** | Storing chat history & embeddings |
| **Cheerio + Axios** | Web scraping for latest F1 data |
| **Tailwind CSS** | Modern UI styling |
| **Puppeteer** | Advanced web scraping automation |

---

## 🔧 Installation & Setup

### 1️⃣ Clone the Repository
```sh
git clone https://github.com/YOUR_USERNAME/F1Chatbot.git
cd F1Chatbot
```

2️⃣ Install Dependencies
```sh
npm install
# or
yarn install
```
3️⃣ Set Up Environment Variables
Create a .env.local file in the root directory and add the required keys:

```sh
# 🔹 AstraDB Configuration
ASTRA_DB_NAMESPACE=your_db_namespace
ASTRA_DB_COLLECTION=f1chat_history
ASTRA_DB_API_ENDPOINT=https://your-astra-endpoint.com
ASTRA_DB_APPLICATION_TOKEN=your_astra_application_token

# 🔹 Claude AI API Key
CLAUDE_API_KEY=your_claude_api_key
```
4️⃣ Start the Development Server

```sh
npm run dev
```
Now, open http://localhost:3000 in your browser.

🚀 Deployment
The easiest way to deploy this Next.js app is via Vercel:

Push your code to GitHub.

Go to Vercel and import the repo.

Add Environment Variables in Vercel Settings.

Click Deploy and your chatbot is live! 🎉

# 🏆 API & Functionality

**🟢 Web Scraping**

F1 data is scraped using Cheerio & Axios from reliable sources like:

Wikipedia: List of F1 Champions

ESPN: F1 Standings & Results

Formula1.com: Latest News

**🤖 AI Chatbot (Claude)**

If scraping fails, Claude AI generates F1 insights.

Handles repeat requests using chat history from AstraDB.

Only uses Claude if scraping is insufficient!

**💾 Chat Storage (AstraDB)**

Stores:

User messages & AI responses

F1 scraped data logs

Ensures persistency & fast retrieval

**🛠️ Useful Commands**

Command	Description

Run the development server
```sh
npm run dev	
```
Build the production app
```sh
npm run build	
```

Start production server
```sh
npm start
```
Run the F1 data scraper manually
```sh
npx ts-node src/lib/scraper.ts
```
Test the API response
```sh
npx ts-node src/app/api/chat/route.ts
```

**📜 Future Improvements**

🚀 More Scraping Sources (BBC, Sky Sports)

🛠 Historical F1 Data Queries

🔄 Live Race Commentary Integration

📊 Analytics Dashboard for User Insights

🏁 Contributing

#Want to improve the F1 Chatbot? PRs are welcome! 🏎️💨

# Fork the repository
```sh
git clone https://github.com/YOUR_USERNAME/F1Chatbot.git
cd F1Chatbot
```

# Create a new feature branch
```sh

git checkout -b feature-xyz

```
# Commit your changes

```sh

git commit -m "Added XYZ feature"
```

# Push & create a pull request
```sh
git push origin feature-xyz
```

📜 License
This project is open-source under the MIT License.

🔥 Enjoy the Fastest AI-Powered F1 Chatbot! 🏎️💨
📩 Feedback? Drop a message at haris.wyne10@gmail.com


---

### ✅ **How to Use It?**
1. Copy **and paste** the command in your **GitHub terminal**.
2. **Press Enter** – It will **create** a `README.md` file with all content.
3. **Commit & Push**:
   ```sh
   git add README.md
   git commit -m "Added detailed README 🚀"
   git push origin main
    ```
