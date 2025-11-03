# YT-Get : A modern, open-source YouTube downloader built for everyone

<div align="center">

<p align="center">
  <img src="https://cvn39oor0x.ufs.sh/f/DcXFl3rOmNR3DkwoHsrOmNR31xhY9ZnitdBGMpe5ITJsgSly" alt="YT-Get Logo" />
</p>

![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)

[Live Demo](https://yt-get.vercel.app) • [Report Bug](https://github.com/wemilabs/yt-get/issues) • [Request Feature](https://github.com/wemilabs/yt-get/issues)

</div>

## ✨ Features

### 🎥 Video Downloading

- **Multiple Formats**: Download videos in various qualities and formats
- **Audio Extraction**: Extract audio as MP3 from any YouTube video
- **Batch Processing**: Handle multiple downloads efficiently
- **Progress Tracking**: Real-time download progress with detailed status updates

### 🔐 User Authentication

- **Secure Login**: Built with Better Auth for secure authentication
- **Account Management**: Complete user profile and account settings
- **Session Persistence**: Stay logged in across browser sessions

### 📊 Download History

- **Download Tracking**: Complete history of all your downloads
- **Usage Statistics**: Monitor your download activity and limits
- **Quick Access**: Easily re-download previously processed videos

### 🎨 Modern UI/UX

- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Dark Mode**: Automatic dark/light theme switching
- **Real-time Updates**: Live status updates and notifications
- **Accessible**: Built with accessibility in mind

### ⚡ Performance

- **Fast Processing**: Optimized download and conversion pipeline
- **Server-side Rendering**: Lightning-fast page loads with Next.js 16
- **Rate Limiting**: Fair usage limits to ensure service stability

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm/yarn

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/wemilabs/yt-get.git
cd yt-get
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Set up environment variables**

```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

4. **Run the development server**

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to start using YT-Get.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/)
- **Authentication**: [Better Auth](https://better-auth.com/)
- **Database**: [Drizzle ORM](https://orm.drizzle.team/) with [Neon PostgreSQL](https://neon.com/)
- **Video Processing**: [yt-dlp](https://github.com/yt-dlp/yt-dlp)
- **Code Quality**: [Biome](https://biomejs.dev/)

## 📁 Project Structure

```
yt-get/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── account/           # User account pages
│   ├── history/           # Download history
│   └── @auth/             # Authentication pages
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── forms/            # Form components
│   └── video-analyzer/   # Main video processing component
├── lib/                   # Utility libraries
├── hooks/                 # Custom React hooks
├── server/                # Server-side utilities
├── db/                    # Database schema and config
└── types/                 # TypeScript type definitions
```

## 🔧 Development

### Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run code quality checks
pnpm format       # Format code with Biome
pnpm db:push      # Push database schema changes
```

### Code Quality

This project uses [Biome](https://biomejs.dev/) for consistent code formatting and linting:

- 2-space indentation
- Automatic import organization
- TypeScript strict mode
- React Compiler enabled for automatic optimizations

## 🌟 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests and linting: `pnpm lint`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

YT-Get is designed for personal and educational use only. Please respect YouTube's Terms of Service and copyright laws. Users are responsible for ensuring they have the right to download and use the content.

## 🤝 Support

- 📧 [Email Support](mailto:support@yt-get.dev)
- 💬 [Discussions](https://github.com/wemilabs/yt-get/discussions)
- 🐛 [Issue Tracker](https://github.com/wemilabs/yt-get/issues)

---

<div align="center">
Made with ❤️ by the open-source community
</div>
