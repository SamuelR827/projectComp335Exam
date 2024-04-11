const WhoamiComponent = () => {
  const [data, setData] = React.useState('');
  React.useEffect(() => {
    fetch('/exam/whoami')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json(); // assuming response is JSON
      })
      .then(data => {
        console.log(data);
        setData(data); 
      })
      .catch(error => {
        console.error('There was a problem with the fetch operation:', error);        
      });
  }, []); // Empty dependency array ensures this effect runs only once, after initial render
  
  return (
    <span>{data.user}</span>
  );
};

const whoami = ReactDOM.createRoot(document.getElementById('whoami'));
whoami.render(<WhoamiComponent />);