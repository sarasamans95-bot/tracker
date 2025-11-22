
# ExpenseTracker

ExpenseTracker is a modern, cloud-powered application to manage and split expenses within groups. Built with **Lovable Cloud** for authentication, database, and serverless functions, ExpenseTracker allows users to track expenses, manage groups, and settle payments seamlessly.

---

## Features

- 🔐 **Authentication:** Signup/login with automatic profile creation.  
- 📊 **Dashboard:** Real-time expense tracking and statistics.  
- 💰 **Expense Management:** Add and split expenses across group members.  
- 👥 **Group Management:** Create groups and invite members via email.  
- 🤝 **Settlement Tracker:** Keep track of who owes what.  
- 🎨 **Design:** Modern teal and coral gradient design with smooth animations.  

---

## Database Schema

**Profiles Table:** Stores user information.

**Groups Table:** Stores group details created by users.  

**Group Members Table:** Tracks membership of users in groups.  

**Expenses Table:** Stores individual expenses within groups.  

**Expense Splits Table:** Tracks how expenses are split and settled among members.  

All tables have **row-level security (RLS)** enabled with policies to ensure users can only access authorized data.  

---

## Backend

The backend is powered by **Lovable Cloud**:

- Database: PostgreSQL with RLS policies
- Authentication: Auto-profile creation on signup
- Serverless functions: Custom logic for expense management

A trigger automatically creates a profile for every new user signing up.

---

## Getting Started

1. **Clone the repository:**

```bash
git clone <repository-url>
cd splitwise-reimagined
````

2. **Install dependencies:**

```bash
bun install
```

3. **Setup environment variables:**

Create a `.env` file with your Lovable Cloud project credentials.

4. **Run the app locally:**

```bash
bun run dev
```

5. **Open in browser:**

Visit `http://localhost:3000` to use ExpenseTracker.

---

## Usage

1. Sign up to create an account.
2. Create a group and add members by email.
3. Add expenses and assign splits to group members.
4. Track balances and settlements in real-time on the dashboard.

---

## Tech Stack

* Frontend: HTML, TypeScript, Tailwind CSS, Vite
* Backend: Lovable Cloud (PostgreSQL, Authentication, Serverless functions)
* Security: Row-level security (RLS) for database tables

---

## License

This project is for educational purposes and can be modified as needed.

---

## Author

Sara Saman

```

---

```
