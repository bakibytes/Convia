import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import HomeIcon from '@mui/icons-material/Home';
import { Alert, IconButton, Snackbar } from '@mui/material';

export default function History() {


    const { getHistoryOfUser } = useContext(AuthContext);

    const [meetings, setMeetings] = useState([])
    const [loading, setLoading] = useState(true)
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' });

    const routeTo = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const history = await getHistoryOfUser();
                if (!Array.isArray(history)) {
                    throw new Error('The history response was not a list.');
                }
                setMeetings(history);
            } catch (error) {
                const message = error?.response?.data?.message || 'Failed to load your meeting history.';
                setSnackbar({ open: true, message, severity: 'error' });
            } finally {
                setLoading(false);
            }
        }

        fetchHistory();
    }, [getHistoryOfUser])

    let formatDate = (dateString) => {

        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0")
        const year = date.getFullYear();

        return `${day}/${month}/${year}`

    }

    return (
        <div>

            <IconButton onClick={() => {
                routeTo("/home")
            }}>
                <HomeIcon />
            </IconButton >
            {
                loading ? <Typography sx={{ p: 2 }}>Loading meeting history...</Typography> :
                (meetings.length !== 0) ? meetings.map((e) => {
                    return (
                        <Card key={e._id} variant="outlined">
                            <CardContent>
                                <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                                    Code: {e.meetingCode}
                                </Typography>

                                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                                    Date: {formatDate(e.date)}
                                </Typography>
                            </CardContent>
                        </Card>
                    )
                }) : <Typography sx={{ p: 2 }}>No meeting history yet.</Typography>

            }

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>

        </div>
    )
}