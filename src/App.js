import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Grid, makeStyles, Paper, Typography } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import AddIcon from "@material-ui/icons/Add";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import CloseIcon from "@material-ui/icons/Close";
import IconButton from "@material-ui/core/IconButton";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import Dialog from "@material-ui/core/Dialog";
import TextField from "@material-ui/core/TextField";
import { Formik } from "formik";
import * as Yup from "yup";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";

const DATA_URL = "https://randomuser.me/api/?page=1&results=10";

const ITEM_HEIGHT = 48;

const useStyles = makeStyles((theme) => ({
  buttonDiv: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: 10,
    marginRight: 10,
  },
  button: {
    color: "purple",
  },
  root: {
    flexGrow: 1,
    width: "100%",
    height: "100%",
  },
  paper: {
    padding: theme.spacing(3),
    margin: 5,
  },
  users: {
    marginLeft: 20,
    fontWeight: "Bold",
  },
  gridContainer: {
    marginTop: 10,
  },
  fontWeight: {
    fontWeight: "Bold",
  },
  padding: {
    padding: 20,
  },
  gridItem: {
    margin: "0 40px",
  },
  errorText: {
    color: "red",
  },
  paperDialog: {
    margin: "30px",
    padding: theme.spacing(3),
  },
}));

const validationSchema = Yup.object().shape({
  phoneNo: Yup.number()
    .typeError("Enter a valid number")
    .positive("Can't start with a minus")
    .integer("Can't include a decimal point")
    .min(1000000000, "Must be of 10 digit")
    .max(9999999999, "must be 10 digit")
    .required("Required"),
  firstName: Yup.string()
    .min(2, "Too Short!")
    .max(50, "Too Long!")
    .required("Firstname is required"),
  lastName: Yup.string()
    .min(2, "Too Short!")
    .max(50, "Too Long!")
    .required("Lastname is required"),
  city: Yup.string().required("Required"),
  state: Yup.string().required("Required"),
  country: Yup.string().required("Required"),
});

function App() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [newEntry, setNewEntry] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState();
  const open = Boolean(anchorEl);

  const classes = useStyles();

  const initialValues = useMemo(() => {
    if (selectedIndex === 0 || selectedIndex) {
      const { name, phone, location } = data[selectedIndex] || {};

      return {
        firstName: name?.first,
        phoneNo: phone,
        lastName: name?.last,
        city: location?.city,
        state: location?.state,
        country: location?.country,
      };
    }
    return {};
  }, [selectedIndex, data]);

  const handleEdit = () => {
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setAnchorEl(null);
  };

  const toggleMenu = (event, index) => {
    setAnchorEl(event?.currentTarget);
    setSelectedIndex(index);
    setNewEntry(false);
  };

  const handleDelete = () => {
    const updatedData = [...data];
    updatedData.splice(selectedIndex, 1);
    setData(updatedData);
    setAnchorEl(null);
  };

  const fetchRandomData = () => {
    return axios
      .get(DATA_URL)
      .then((res) => {
        setData(res.data.results);
      })
      .catch((err) => {
        console.log("----->err", err);
      });
  };

  useEffect(() => {
    fetchRandomData();
    setLoading(false);
  }, []);

  const onSubmit = (values) => {
    const { firstName, lastName, city, state, country, phoneNo, emailId } =
      values;

    const newList = data.concat({
      name: { first: firstName, last: lastName },
      location: { city: city, state: state, country: country },
      email: emailId,
      phone: phoneNo,
    });

    setData(newList);
    handleDialogClose();
  };

  const onEdit = (values) => {
    const { firstName, lastName, city, state, country, phoneNo, emailId } =
      values;

    const userData = {
      name: { first: firstName, last: lastName },
      location: { city, state, country },
      email: emailId,
      phone: phoneNo,
    };

    let newList = data;
    newList[selectedIndex] = userData;
    setData([...newList]);
    handleDialogClose();
  };

  return (
    <div className={classes.root}>
      {loading ? (
        <div>...loading...</div>
      ) : (
        <div>
          <div className={classes.buttonDiv}>
            <Button
              color="primary"
              onClick={() => {
                setSelectedIndex(null);
                setOpenDialog(true);
                setNewEntry(true);
              }}
              variant="contained"
            >
              <AddIcon />
              New user
            </Button>
          </div>
          <Typography className={classes.users}>Users</Typography>
          <Grid container spacing={3} className={classes.gridContainer}>
            {data?.map((value, index) => {
              return (
                <Grid item xs={5} className={classes.gridItem}>
                  <Paper elevation={0} style={{ borderRadius: 10 }}>
                    <Grid
                      container
                      className={classes.padding}
                      justify="space-between"
                      alignItems="center"
                    >
                      <Grid item>
                        <Grid container direction="column">
                          <Grid item className={classes.fontWeight}>
                            {value?.name?.first}
                          </Grid>
                          <Grid item>
                            {value?.location?.city},{value?.location?.state},
                            {value?.location?.country}
                          </Grid>
                        </Grid>
                      </Grid>
                      <Grid item>
                        <IconButton
                          aria-label="more"
                          aria-controls="long-menu"
                          aria-haspopup="true"
                          onClick={(e) => toggleMenu(e, index)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
          <Menu
            id="long-menu"
            anchorEl={anchorEl}
            keepMounted
            open={open}
            onClose={() => toggleMenu()}
            PaperProps={{
              elevation: 1,
              style: {
                maxHeight: ITEM_HEIGHT * 4.5,
                width: "20ch",
              },
            }}
          >
            <MenuItem onClick={handleEdit}>Edit</MenuItem>
            <MenuItem onClick={handleDelete}>Delete</MenuItem>
          </Menu>
          <Dialog
            className={classes.dialog}
            fullScreen
            open={openDialog}
            onClose={handleDialogClose}
            class
          >
            <Paper elevation={3} className={classes.paperDialog}>
              <Formik
                initialValues={initialValues}
                enableReinitialize
                validationSchema={validationSchema}
                onSubmit={newEntry ? onSubmit : onEdit}
              >
                {({ errors, touched, handleChange, handleSubmit, values }) => (
                  <div>
                    <Grid container justify="space-between">
                      <Grid item>
                        {newEntry ? (
                          <div>
                            <Typography>New User</Typography>
                          </div>
                        ) : (
                          <div>
                            <Typography>Edit User</Typography>
                          </div>
                        )}
                      </Grid>
                      <Grid item>
                        <IconButton onClick={handleDialogClose}>
                          <CloseIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                    <Grid
                      container
                      className={classes.gridContainer}
                      justify="flex-start"
                      spacing={3}
                    >
                      <Grid item>
                        <CheckCircleIcon />
                      </Grid>
                      <Grid item>
                        <Typography>Basic details</Typography>
                      </Grid>
                    </Grid>
                    <Grid container spacing={4}>
                      <Grid item xs>
                        <Grid container spacing={2} direction="column">
                          <Grid item xs>
                            <Typography className={classes.fontWeight}>
                              First name
                            </Typography>
                          </Grid>
                          <Grid item xs>
                            <TextField
                              id="filled-basic"
                              name="firstName"
                              label="First Name"
                              variant="filled"
                              size="small"
                              value={values.firstName}
                              onChange={handleChange}
                              style={{ width: "100%" }}
                            />
                          </Grid>
                          {console.log("----->errors", errors)}
                          <Grid item>
                            {touched.firstName && errors.firstName && (
                              <div className={classes.errorText}>
                                {errors.firstName}
                              </div>
                            )}
                          </Grid>
                        </Grid>
                      </Grid>
                      <Grid item xs>
                        <Grid container spacing={2} direction="column">
                          <Grid item xs>
                            <Typography className={classes.fontWeight}>
                              Last name
                            </Typography>
                          </Grid>
                          <Grid item xs>
                            <TextField
                              id="filled-basic"
                              name="lastName"
                              label="Last Name"
                              variant="filled"
                              size="small"
                              value={values.lastName}
                              onChange={handleChange}
                              style={{ width: "100%" }}
                            />
                          </Grid>
                          <Grid item>
                            {touched.lastName && errors.lastName && (
                              <div className={classes.errorText}>
                                {errors.lastName}
                              </div>
                            )}
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid container spacing={4}>
                      <Grid item xs>
                        <Grid container spacing={2} direction="column">
                          <Grid item xs>
                            <Typography className={classes.fontWeight}>
                              Phone Number
                            </Typography>
                          </Grid>
                          <Grid item xs>
                            <TextField
                              id="filled-basic"
                              name="phoneNo"
                              label="Phone No"
                              variant="filled"
                              size="small"
                              value={values.phoneNo}
                              onChange={handleChange}
                              style={{ width: "100%" }}
                            />
                          </Grid>
                          <Grid item>
                            {touched.phoneNo && errors.phoneNo && (
                              <div className={classes.errorText}>
                                {errors.phoneNo}
                              </div>
                            )}
                          </Grid>
                        </Grid>
                      </Grid>
                      <Grid item xs>
                        <Grid container spacing={2} direction="column">
                          <Grid item xs>
                            <Typography className={classes.fontWeight}>
                              Country
                            </Typography>
                          </Grid>
                          <Grid item xs>
                            <TextField
                              id="filled-basic"
                              name="country"
                              label="Country"
                              variant="filled"
                              size="small"
                              value={values.country}
                              onChange={handleChange}
                              style={{ width: "100%" }}
                            />
                          </Grid>
                          <Grid item>
                            {touched.country && errors.country && (
                              <div className={classes.errorText}>
                                {errors.country}
                              </div>
                            )}
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid container spacing={4}>
                      <Grid item xs>
                        <Grid container spacing={2} direction="column">
                          <Grid item xs>
                            <Typography className={classes.fontWeight}>
                              City
                            </Typography>
                          </Grid>
                          <Grid item xs>
                            <TextField
                              id="filled-basic"
                              name="city"
                              label="City"
                              variant="filled"
                              size="small"
                              value={values.city}
                              onChange={handleChange}
                              style={{ width: "100%" }}
                            />
                          </Grid>
                          <Grid item>
                            {touched.city && errors.city && (
                              <div className={classes.errorText}>
                                {errors.city}
                              </div>
                            )}
                          </Grid>
                        </Grid>
                      </Grid>
                      <Grid item xs>
                        <Grid container spacing={2} direction="column">
                          <Grid item xs>
                            <Typography className={classes.fontWeight}>
                              State
                            </Typography>
                          </Grid>
                          <Grid item xs>
                            <TextField
                              id="filled-basic"
                              name="state"
                              label="State"
                              variant="filled"
                              size="small"
                              value={values.state}
                              onChange={handleChange}
                              style={{ width: "100%" }}
                            />
                          </Grid>
                          <Grid item>
                            {touched.state && errors.state && (
                              <div className={classes.errorText}>
                                {errors.state}
                              </div>
                            )}
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                    <div className={classes.buttonDiv}>
                      <Button
                        color="primary"
                        type="submit"
                        onClick={() => {
                          handleSubmit();
                        }}
                        variant="contained"
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                )}
              </Formik>
            </Paper>
          </Dialog>
        </div>
      )}
    </div>
  );
}

export default App;
