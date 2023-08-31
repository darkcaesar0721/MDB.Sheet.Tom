import './App.css';
import {ConfigProvider} from "antd";
import AppRouter from "./AppRouter";

function App() {
    return (
        <>
            <ConfigProvider>
                <AppRouter />
            </ConfigProvider>
        </>
    );
}
export default App;
