import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import '../index.css';
import '../readict.css';
import { DemoProvider } from './model';
import { UserCenter } from './screens';
import './user-center.css';
createRoot(document.getElementById('root')!).render(<StrictMode><HashRouter><DemoProvider><UserCenter /></DemoProvider></HashRouter></StrictMode>);
