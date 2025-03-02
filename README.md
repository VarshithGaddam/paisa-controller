# Paisa Controller

## Project Overview
Paisa Controller is an AI-powered personal finance management web application designed to help users track expenses, manage budgets, and gain actionable financial insights. Built as a hackathon project, it combines a sleek, modern UI with advanced features like receipt scanning via OCR, voice command input, and predictive analytics. Whether you're a daily user or a hackathon enthusiast, Paisa Controller simplifies money management with real-time data and an intuitive design.

### Features
- **Expense Tracking**: Add expenses manually, via receipt scanning (OCR), or voice commands.
- **Budget Management**: Create, monitor, and share budgets with real-time overspending alerts.
- **Financial Insights**: View spending trends, budget status, and savings goals in a dynamic slideshow.
- **Reports**: Visualize financial data with interactive charts (Pie, Line, Bar, Candlestick) and export to CSV.
- **Customization**: Multi-currency support, dark/light mode toggle, and primary color personalization.
- **AI Capabilities**: Predictive spending analysis and category suggestions based on descriptions.
- **User Experience**: Onboarding tour, loading animations, and glassmorphic design.

## Tech Stack
- **Frontend**: React.js (v18), Material-UI (v5), Framer Motion (animations), React Slick (slideshow)
- **Backend**: Firebase (Authentication, Firestore for real-time database)
- **AI & OCR**: Tesseract.js (receipt scanning), basic predictive analytics (linear regression)
- **Visualization**: Chart.js, react-chartjs-2 (charts), react-tsparticles (particles)
- **Voice Input**: react-speech-recognition
- **Deployment**: Firebase Hosting
- **Other Tools**: Axios (API calls), Notistack (notifications), react-beautiful-dnd (draggable widgets, optional)

## Implementation
### Architecture
- **React SPA**: Single-page application with client-side routing via `react-router-dom`.
- **Firebase Integration**: Authentication (Google login) and Firestore for expenses/budgets storage.
- **State Management**: Local component state with React hooks (`useState`, `useEffect`).
- **UI Design**: Glassmorphic design with Poppins typography, dynamic theming via Material-UI.

### Key Components
- **Dashboard**: Central hub with financial insights slideshow, budget overview, and about section.
- **Expenses**: Form with OCR and voice input, table display of expense history.
- **Budgets**: Budget creation with real-time alerts and sharing via copied links.
- **Reports**: Financial dashboard with gauges and charts, enhanced with lightning effects on hover.
- **Settings**: Profile management, currency/language selection, savings goal, and theme customization.
- **Authentication**: Google login via Firebase Auth.

### Deployment
- Built with `npm run build` and deployed to Firebase Hosting (`firebase deploy`).
- Hosted URL: `https://paisa-controller-12345.web.app` (replace with your actual URL post-deployment).

## Setup Instructions
### Prerequisites
- Node.js (v16+ recommended) and npm
- Firebase account and project setup
- Git installed

### Installation
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/paisa-controller.git
   cd paisa-controller
   npm install
   ```

2. **Configure Firebase**:
- Create a Firebase project at Firebase Console.
- Enable Authentication (Google sign-in) and Firestore.
- Copy your Firebase config from Project Settings > General > Your Apps.
- Update `src/firebase.js`:

```javascript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

3. **Run Locally**:
```bash
npm start
```
Opens `http://localhost:3000` in your browser.

4. **Build for Production**:
```bash
npm run build
```

5. **Deploy to Firebase (Optional)**:
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

### Future Scope
- **Mobile App**: Convert to a native app using Capacitor or React Native for iOS/Android.
- **Advanced AI**: Integrate machine learning for smarter budget recommendations and expense categorization.
- **Multi-User Support**: Add collaborative budgeting features (e.g., shared budgets with family).
- **Notifications**: Push notifications for budget alerts via Firebase Cloud Messaging.
- **Offline Mode**: Implement service workers for offline expense tracking.
- **Enhanced Visualizations**: Add 3D charts or animated transitions for reporting.

## Contributing
- Fork the repository, make changes, and submit a pull request.
- Report issues or suggest features via GitHub Issues.

## License
MIT License - feel free to use, modify, and distribute.

### Author: Varshith
- **GitHub**: [your-username](https://github.com/your-username)
- **Deployed App**: [Paisa Controller](https://paisa-controller-12345.web.app)

