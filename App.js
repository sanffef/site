import React, { useState, useEffect } from 'react';
import './App.css';

const INITIAL_USERS = [
  { username: 'admin', password: '123', role: 'admin' },
  { username: 'sec', password: '123', role: 'secretary' },
  { username: 'student', password: '123', role: 'student' },
];

const App = () => {
  const [users, setUsers] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [regForm, setRegForm] = useState({ username: '', password: '', role: 'student' });
  const [isRegistering, setIsRegistering] = useState(false);
  const [fileInput, setFileInput] = useState(null);

  
  useEffect(() => {
    const storedUsers = JSON.parse(localStorage.getItem('app_users'));
    const storedDocs = JSON.parse(localStorage.getItem('app_docs'));
    
    if (storedUsers) setUsers(storedUsers);
    else {
      setUsers(INITIAL_USERS);
      localStorage.setItem('app_users', JSON.stringify(INITIAL_USERS));
    }

    if (storedDocs) setDocuments(storedDocs);
  }, []);

  useEffect(() => {
    localStorage.setItem('app_docs', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('app_users', JSON.stringify(users));
  }, [users]);


  const handleLogin = (e) => {
    e.preventDefault();
    const user = users.find(
      (u) => u.username === loginForm.username && u.password === loginForm.password
    );
    if (user) {
      setCurrentUser(user);
      setLoginForm({ username: '', password: '' });
    } else {
      alert('Неверный логин или пароль');
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    const exists = users.find((u) => u.username === regForm.username);
    if (exists) {
      alert('Пользователь уже существует');
      return;
    }
    const newUser = { ...regForm };
    setUsers([...users, newUser]);
    alert('Регистрация успешна! Теперь войдите.');
    setIsRegistering(false);
    setRegForm({ username: '', password: '', role: 'student' });
  };

  const logout = () => {
    setCurrentUser(null);
  };


  const handleUpload = (e) => {
    e.preventDefault();
    if (!fileInput) return;

    const newDoc = {
      id: Date.now(),
      studentName: currentUser.username,
      fileName: fileInput.name,
      date: new Date().toLocaleString(),
      status: 'На проверке',
    };

    setDocuments([...documents, newDoc]);
    setFileInput(null);
    alert('Документ отправлен!');
  };

  const updateStatus = (id, newStatus) => {
    const updatedDocs = documents.map((doc) =>
      doc.id === id ? { ...doc, status: newStatus } : doc
    );
    setDocuments(updatedDocs);
  };

  const deleteUser = (username) => {
    if (username === 'admin') return alert('Нельзя удалить главного админа');
    setUsers(users.filter((u) => u.username !== username));
  };


  if (!currentUser) {
    return (
      <div className="container auth-container">
        <h1>Система документооборота</h1>
        {isRegistering ? (
          <form onSubmit={handleRegister} className="card">
            <h2>Регистрация</h2>
            <input
              type="text"
              placeholder="Логин"
              required
              value={regForm.username}
              onChange={(e) => setRegForm({ ...regForm, username: e.target.value })}
            />
            <input
              type="password"
              placeholder="Пароль"
              required
              value={regForm.password}
              onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
            />
            <select
              value={regForm.role}
              onChange={(e) => setRegForm({ ...regForm, role: e.target.value })}
            >
              <option value="student">Студент</option>
              <option value="secretary">Секретарь</option>
              <option value="admin">Админ</option>
            </select>
            <button type="submit">Зарегистрироваться</button>
            <p onClick={() => setIsRegistering(false)} className="link">Вернуться ко входу</p>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="card">
            <h2>Вход</h2>
            <input
              type="text"
              placeholder="Логин"
              required
              value={loginForm.username}
              onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
            />
            <input
              type="password"
              placeholder="Пароль"
              required
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
            />
            <button type="submit">Войти</button>
            <p onClick={() => setIsRegistering(true)} className="link">Нет аккаунта? Создать</p>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="container dashboard">
      <header>
        <div>
          <strong>Пользователь:</strong> {currentUser.username} <br />
          <strong>Роль:</strong> {currentUser.role.toUpperCase()}
        </div>
        <button onClick={logout} className="logout-btn">Выйти</button>
      </header>

      <main>
        {/* --- ИНТЕРФЕЙС СТУДЕНТА --- */}
        {currentUser.role === 'student' && (
          <div className="role-view">
            <h2>Мои документы</h2>
            <form onSubmit={handleUpload} className="upload-form">
              <input 
                type="file" 
                required 
                onChange={(e) => setFileInput(e.target.files[0])} 
              />
              <button type="submit">Загрузить документ</button>
            </form>
            
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Файл</th>
                    <th>Дата</th>
                    <th>Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.filter(d => d.studentName === currentUser.username).map(doc => (
                    <tr key={doc.id}>
                      <td>
                        <div>{doc.fileName}</div>
                        <a 
                          href={`http://localhost:5000/uploads/${doc.fileName}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          download
                          style={{ fontSize: '12px', color: '#007bff', textDecoration: 'underline' }}
                        >
                          Скачать
                        </a>
                      </td>
                      <td>{doc.date}</td>
                      <td>
                        <span className={`status ${doc.status === 'Принят' ? 'green' : doc.status === 'Отклонен' ? 'red' : 'yellow'}`}>
                          {doc.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- ИНТЕРФЕЙС СЕКРЕТАРЯ --- */}
        {currentUser.role === 'secretary' && (
          <div className="role-view">
            <h2>Входящие документы</h2>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Студент</th>
                    <th>Файл</th>
                    <th>Статус</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map(doc => (
                    <tr key={doc.id}>
                      <td>{doc.studentName}</td>
                      <td>
                        <div>{doc.fileName}</div>
                        <a 
                          href={`http://localhost:3000/uploads/${doc.fileName}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          download
                          style={{ fontSize: '12px', color: '#007bff', textDecoration: 'underline' }}
                        >
                          Скачать
                        </a>
                      </td>
                      <td>
                        <span className={`status ${doc.status === 'Принят' ? 'green' : doc.status === 'Отклонен' ? 'red' : 'yellow'}`}>
                          {doc.status}
                        </span>
                      </td>
                      <td>
                        {doc.status === 'На проверке' && (
                          <div className="actions">
                            <button onClick={() => updateStatus(doc.id, 'Принят')} className="btn-accept">✔</button>
                            <button onClick={() => updateStatus(doc.id, 'Отклонен')} className="btn-reject">✖</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- ИНТЕРФЕЙС АДМИНА --- */}
        {currentUser.role === 'admin' && (
          <div className="role-view">
            <h2>Панель Администратора</h2>
            <div className="stats">
              <div className="stat-card">Всего пользователей: {users.length}</div>
              <div className="stat-card">Всего документов: {documents.length}</div>
            </div>

            <h3>Управление пользователями</h3>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Логин</th>
                    <th>Роль</th>
                    <th>Действие</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, idx) => (
                    <tr key={idx}>
                      <td>{user.username}</td>
                      <td>{user.role}</td>
                      <td>
                        {user.role !== 'admin' && (
                          <button onClick={() => deleteUser(user.username)} className="btn-reject">Удалить</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;