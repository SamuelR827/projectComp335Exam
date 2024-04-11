const AssignmentsComponent = () => {
  React.useEffect(() => {
    fetch('/exam/notAdminOut')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json(); // assuming response is JSON
      })
      .then(data => {
        console.log(data);
        const dataTable = new simpleDatatables.DataTable("#myTable"); 
        dataTable.insert(data);
      })
      .catch(error => {
        console.error('There was a problem with the fetch operation:', error);        
      });
  }, []); // Empty dependency array ensures this effect runs only once, after initial render
  
  return (
    <div>
      <table id="myTable">
        <thead>
          <tr><th>username</th><th>description</th><th>due</th></tr>
        </thead>
      </table>
    </div>
  );
};

const assignments = ReactDOM.createRoot(document.getElementById('assignments'));
assignments.render(<AssignmentsComponent />);