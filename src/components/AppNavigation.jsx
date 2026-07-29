import { createElement } from 'react';
import { Archive, Box, Factory, LayoutGrid, ShoppingCart } from 'lucide-react';

const navigationByUser = {
  main: [
    ['organizer', LayoutGrid, 'Organizador'],
    ['stations', Factory, 'Estaciones'],
    ['warehouses', Archive, 'Almacenes'],
    ['company', Archive, 'Empresa'],
    ['workforce', Archive, 'Fuerza Laboral'],
    ['register', Box, 'Productos'],
    ['buy', ShoppingCart, 'Tienda'],
  ],
  store: [
    ['organizer', LayoutGrid, 'Organizador'],
    ['register', Box, 'Productos'],
    ['buy', ShoppingCart, 'Tienda'],
  ],
};

const AppNavigation = ({ currentUser, currentView, onNavigate }) => (
  <div className="flex justify-center space-x-2 mb-8">
    {navigationByUser[currentUser].map(([view, icon, label]) => (
      <button
        key={view}
        onClick={() => onNavigate(view)}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
          currentView === view
            ? 'bg-indigo-600 text-white shadow-md'
            : 'text-gray-600 hover:bg-gray-200'
        }`}
      >
        {createElement(icon, { size: 20 })}
        <span>{label}</span>
      </button>
    ))}
  </div>
);

export default AppNavigation;
