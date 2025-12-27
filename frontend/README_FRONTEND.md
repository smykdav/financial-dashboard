# Financial Dashboard - Frontend

React TypeScript frontend application for the Financial Dashboard.

## Запуск застосунку

```bash
# 1. Встановити залежності (якщо ще не зробили)
export PATH="/opt/homebrew/bin:$PATH"
npm install

# 2. Запустити розробницький сервер
npm run dev
```

Додаток буде доступний за адресою: http://localhost:5173

## Облікові дані за замовчуванням

- **Username**: admin
- **Password**: admin123

## Структура проекту

- `src/pages/` - Сторінки додатку
- `src/components/` - React компоненти
- `src/services/` - API сервіси
- `src/contexts/` - React контексти (AuthContext)
- `src/types/` - TypeScript типи

## Доступні сторінки

1. **Dashboard** (/) - Дашборд з графіками
2. **View Data** (/view-data) - Перегляд даних
3. **Import Data** (/import) - Імпорт CSV файлів

## Формат CSV файлів

### Financial Report CSV:
```csv
Month,Total Income,Total Expenses,Net Profit,Operating Expenses,Marketing Expenses,Payroll Expenses
January,50000,30000,20000,10000,5000,15000
February,55000,32000,23000,11000,5500,15500
```

### Delivery Report CSV:
```csv
Month,Total Deliveries,On Time Deliveries,Late Deliveries,Delivery Accuracy,Total Revenue,Delivery Costs
January,150,140,10,93.33,25000,5000
February,180,175,5,97.22,30000,6000
```
