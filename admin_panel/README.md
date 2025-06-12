# Xray Node Manager - Admin Panel

A modern, responsive admin panel for managing Xray nodes, users, subscriptions, and system analytics.

## 🚀 Features

- **Modern UI Design**: Built with React, Shadcn UI, and TailwindCSS
- **Comprehensive Management**: Users, nodes, plans, subscriptions, and traffic analytics
- **Real-time Dashboard**: System status, statistics, and activity monitoring
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Role-based Access**: Secure authentication and authorization system
- **Beautiful Animations**: Smooth transitions and micro-interactions

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript
- **UI Components**: Shadcn UI
- **Styling**: TailwindCSS 4.0
- **State Management**: React Context + Hooks
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form + Zod
- **Icons**: Lucide React
- **Build Tool**: Vite

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd admin_panel
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Update the `.env` file with your backend API URL:
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🏗️ Project Structure

```
admin_panel/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Shadcn UI components
│   │   ├── dashboard/      # Dashboard-specific components
│   │   ├── nodes/          # Node management components
│   │   ├── plans/          # Plan management components
│   │   ├── users/          # User management components
│   │   └── user_groups/    # User group components
│   ├── contexts/           # React contexts
│   ├── layouts/            # Layout components
│   ├── lib/                # Utility functions and validators
│   ├── pages/              # Page components
│   ├── router/             # Routing configuration
│   └── services/           # API services
├── public/                 # Static assets
└── ...config files
```

## 🎨 Design System

The admin panel uses a modern design system with:

- **Glassmorphism effects**: Translucent backgrounds with blur effects
- **Gradient accents**: Beautiful color gradients for visual hierarchy
- **Micro-interactions**: Hover effects, transitions, and animations
- **Consistent spacing**: 8px grid system
- **Typography scale**: Hierarchical text sizing
- **Color palette**: Comprehensive color system with semantic meanings

## 🔐 Authentication

The admin panel supports role-based authentication:

- **SUPER_ADMIN**: Full system access
- **ADMIN**: Most administrative functions
- **USER**: Limited access (redirected to user panel)

Default credentials for development:
- Email: `admin@example.com`
- Password: `password`

## 📱 Responsive Design

The interface is fully responsive with breakpoints:
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🚀 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔧 Configuration

### Environment Variables

- `VITE_API_BASE_URL` - Backend API base URL

### Customization

The design system can be customized through:
- `tailwind.config.js` - TailwindCSS configuration
- `src/index.css` - Global styles and CSS variables
- `components.json` - Shadcn UI configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code comments

---

Built with ❤️ using modern web technologies