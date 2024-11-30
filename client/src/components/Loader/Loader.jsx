import { MoonLoader } from 'react-spinners'

function Loader() {
  return (
    <div style={styles.container}>
      <MoonLoader color="#ffd57d" />
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh', // Full viewport height
  },
};

export default Loader; 