import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [ticketData, setTicketData] = useState([]);
  const [groupBy, setGroupBy] = useState('status');
  const [sortBy, setSortBy] = useState('priority');
  const [userData, setUserData] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchTicketData = async () => {
      try {
        const response = await fetch('https://api.quicksell.co/v1/internal/frontend-assignment');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setTicketData(data.tickets || []);
        setUserData(data.users || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchTicketData();
  }, []);

  const columns = {
    'To-Do': 'Todo',
    'In Progress': 'In progress',
    'Completed': 'Completed',
    'Done': 'Done',
    'Cancelled': 'Cancelled'
  };
  
  

  function createTicketCard(ticket) {
    return (
      <div className={`ticket-card ${ticket.status.toLowerCase().replace(/\s/g, '-')}`} key={ticket.id}>
        <div className="ticket-id">{ticket.id}</div>
        <div className="ticket-title"> <input type="checkbox" id="checkbox" />{ticket.title}</div>
        <div className="ticket-details">
          <p>Assigned to: {getUserById(ticket.userId)}</p>
        </div>
      </div>
    );
  }
  function getUserById(userId) {
    const user = userData.find(user => user.id === userId);
    return user ? user.name : 'Unknown User';
  }

  function groupTicketsByUser() {
    const groupedTickets = {};

    ticketData.forEach(ticket => {
      const userId = ticket.userId;
      if (!groupedTickets[userId]) {
        groupedTickets[userId] = [];
      }
      groupedTickets[userId].push(ticket);
    });

    return groupedTickets;
  }

  function groupTicketsByPriority() {
    const groupedTickets = {
      'No Risk': [],
      'Urgent': [],
      'High Risk': [],
      'Medium Risk': [],
      'Low Risk': []
    };

    ticketData.forEach(ticket => {
      const priorityGroup = getPriorityGroup(ticket.priority);
      groupedTickets[priorityGroup].push(ticket);
    });

    return groupedTickets;
  }

  function getPriorityGroup(priority) {
    if (priority === 0) return 'No Risk';
    if (priority === 1) return 'Urgent';
    if (priority === 2) return 'High Risk';
    if (priority === 3) return 'Medium Risk';
    if (priority === 4) return 'Low Risk';
    return 'Unknown Priority';
  }

  function sortTicketsByPriority(tickets) {
    return tickets.slice().sort((a, b) => a.priority - b.priority);
  }

  function sortTicketsByTitle(tickets) {
    return tickets.slice().sort((a, b) => a.title.localeCompare(b.title));
  }

  function handleGroupByChange(event) {
    setGroupBy(event.target.value);
  }

  function handleSortByChange(event) {
    setSortBy(event.target.value);
  }

  return (
    <div className="kanban-board">
      <div className="controls">
  <div className="dropdown-control">
    <button onClick={() => setIsDropdownOpen(!isDropdownOpen)}>Display</button>
    {isDropdownOpen && (
      <div className="control-group">
        <link rel="icon" href="%PUBLIC_URL%/public/icons/setting-lines.png" />
        <label htmlFor="group-by">Grouping:</label>
        <select id="group-by" value={groupBy} onChange={handleGroupByChange}>
          <option value="status">Status</option>
          <option value="user">User</option>
          <option value="priority">Priority</option>
        </select>
      </div>
    )}
    {isDropdownOpen && (
      <div className="control-group">
        <label htmlFor="sort-by">Ordering:</label>
        <select id="sort-by" value={sortBy} onChange={handleSortByChange}>
          <option value="priority">Priority</option>
          <option value="title">Title</option>
        </select>
      </div>
    )}
  </div>
</div>
      {groupBy === 'status' ? renderBoardByStatus() : renderBoardByGroup(groupBy)}
    </div>
  );

  function renderBoardByStatus() {
    if (!ticketData) {
      return <p>Loading...</p>;
    }

    return (
      <div className="kanban-board">
        {Object.keys(columns).map(status => (
          <div className="column" id={status} key={status}>
            <h2>{status}</h2>
            {ticketData
              .filter(ticket => ticket.status === columns[status])
              .sort((a, b) => (sortBy === 'priority' ? a.priority - b.priority : a.title.localeCompare(b.title)))
              .map(ticket => createTicketCard(ticket))}
          </div>
        ))}
      </div>
    );
  }

  function renderBoardByGroup(group) {
    if (!ticketData) {
      return <p>Loading...</p>;
    }
  
    const groupedTickets = group === 'user' ? groupTicketsByUser() : groupTicketsByPriority();
  
    return (
      <div className="kanban-board">
        {Object.keys(groupedTickets).map(groupKey => (
          <div className="column" id={groupKey} key={groupKey}>
            <h2>{group === 'user' ? getUserById(groupKey) : groupKey}</h2>
            {groupedTickets[groupKey]
              .sort((a, b) => (sortBy === 'priority' ? a.priority - b.priority : a.title.localeCompare(b.title)))
              .map(ticket => createTicketCard(ticket))}
          </div>
        ))}
      </div>
    );
  }
}

export default App;