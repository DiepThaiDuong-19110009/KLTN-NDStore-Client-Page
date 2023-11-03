import { useEffect, useState } from "react";
import Loading from "../../components/Loading/Loading";
import Header from "../../components/Header/Header";
import { Breadcrumbs, Drawer, FormControl, FormControlLabel, MenuItem, Modal, Paper, Select, Switch, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Menu from "../../components/Menu/Menu";
import Footer from "../../components/Footer/Footer";
import VisibilityIcon from '@material-ui/icons/Visibility';
import EditIcon from '@material-ui/icons/Edit';
import { PATH } from "../../contants/Path";
import managementCategoryApi from "../../apis/management-category.api";
import CategoryDetailManagement from "./CategoryDetailManagement/CategoryDetailManagement";

const CategoryManagement = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [openDetail, setOpenDetail] = useState(false);
    const [categoryIdDetail, setCategoryIdDetail] = useState('')

    // data for call api get all
    const [size, setSize] = useState(5)
    const [page, setPage] = useState(0)

    // Option search
    const [state, setState] = useState('')

    // set datar response
    const [totalAmount, setTotalAmount] = useState(0);
    const [totalPage, setTotalPage] = useState(0);
    const [listCategory, setListCategory] = useState([]);

    const navigate = useNavigate()

    const handleChangePage = (e, newPage) => {
        setPage(newPage)
    };

    const handleChangeSize = (event) => {
        setSize(parseInt(+event.target.value));
        setPage(0);
    };

    const handleClickBreadcrumb = (link) => {
        navigate(link);
    }

    useEffect(() => {
        getAllCategory(page, size, state);
    }, [page, size, state])

    const getAllCategory = (page, size, state) => {
        setIsLoading(true)
        managementCategoryApi
            .getCategoryList(page, size, state)
            .then((res) => {
                if (res?.success === true) {
                    setTotalAmount(res?.data?.totalCategory)
                    setTotalPage(res?.data?.totalPage)
                    setListCategory(res?.data?.listCategory)
                    setIsLoading(false);
                } else {
                    setTotalAmount(0)
                    setTotalPage(0)
                    setListCategory([])
                    setIsLoading(false);
                }
            })
            .catch((err) => {
                setIsLoading(false);
                console.log(err)
            })
    }

    const updateStatusBrand = (id, status) => {
        if (!id || !status) {
            return;
        }
        setIsLoading(true)
        if (status === 'enable') {
            managementCategoryApi
                .setStatusCategoryToDisable(id)
                .then((res) => {
                    if (res?.success === true) {
                        getAllCategory(page, size, state);
                        setIsLoading(false);
                    }
                })
                .catch((err) => {
                    setIsLoading(false);
                    console.log(err?.status)
                })
        } else if (status === 'disable') {
            managementCategoryApi
                .setStatusCategoryToEnable(id)
                .then((res) => {
                    if (res?.success === true) {
                        getAllCategory(page, size, state);
                        setIsLoading(false);
                    }
                })
                .catch((err) => {
                    setIsLoading(false);
                    console.log(err)
                })
        }
    }

    const showDetailUser = (id) => {
        setCategoryIdDetail(id)
        setOpenDetail(true)
    }

    const handleClose = () => {
        setOpenDetail(false)
    }


    return (
        <div style={{ paddingLeft: '260px' }}>
            {isLoading ? <Loading isLoading={isLoading} /> : undefined}
            <div style={{ position: 'fixed', top: '0', left: '0', width: '100%', zIndex: '1300' }}>
                <Header />
            </div>
            <Drawer
                variant="permanent"
                open
                anchor="left">
                <Menu selected='category' />
            </Drawer>
            <div style={{ padding: '70px 15px 70px 15px', height: 'auto' }}>
                <Breadcrumbs aria-label="breadcrumb">
                    <Typography onClick={() => handleClickBreadcrumb('/home')} color="gray" fontSize='14px' style={{ cursor: 'pointer' }}>Trang chủ</Typography>
                    <Typography color="var(--main-color)" fontSize='14px'>Quản lý danh mục</Typography>
                </Breadcrumbs>
                <div>
                    <div style={{ margin: '15px 0' }}>
                        <h3 style={{ marginBottom: '15px' }}>Quản lý danh mục</h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>Tổng số danh mục: <strong>{totalAmount}</strong></span>
                            <button onClick={() => navigate(PATH.CATEGORY_CREATE)} style={{
                                backgroundColor: 'var(--main-color)', border: 'none',
                                outline: 'none', padding: '10px 20px', color: 'white', borderRadius: '5px', cursor: 'pointer'
                            }}>Thêm mới</button>
                        </div>
                    </div>
                    <FormControl sx={{ minWidth: 300 }} style={{ marginBottom: '20px', backgroundColor: 'white' }}>
                        <Select
                            value={state}
                            onChange={(e) => {setState(e.target.value); setPage(0); setSize(5)}}
                            displayEmpty
                            inputProps={{ 'aria-label': 'Without label' }}
                        >
                            <MenuItem value="">
                                <em>Tất cả trạng thái</em>
                            </MenuItem>
                            <MenuItem value={'enable'}>Đang hoạt động</MenuItem>
                            <MenuItem value={'disable'}>Khóa</MenuItem>
                        </Select>
                    </FormControl>
                    <Paper style={{ width: '100%' }}>
                        <TableContainer>
                            <Table stickyHeader aria-label="sticky table" style={{ width: '100%' }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell style={{ fontWeight: 'bold' }} align="center">#</TableCell>
                                        <TableCell style={{ fontWeight: 'bold' }} align="left">Tên danh mục</TableCell>
                                        <TableCell style={{ fontWeight: 'bold' }} align="left">Hình ảnh</TableCell>
                                        <TableCell style={{ fontWeight: 'bold' }} align="left">Trạng thái</TableCell>
                                        <TableCell style={{ fontWeight: 'bold' }} align="right"></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {listCategory?.map((category, index) => (
                                        <TableRow key={category?.id} hover role="checkbox" tabIndex={-1}>
                                            <TableCell align="center">{index + 1}</TableCell>
                                            <TableCell align="left">{category?.titleCategory}</TableCell>
                                            <TableCell align="left">
                                                <img style={{ width: '70px' }} alt={category?.titleCategory} src={category?.imageCategory}></img>
                                            </TableCell>
                                            <TableCell align="left">
                                                <FormControlLabel
                                                    control={
                                                        <Switch
                                                            checked={category.state === 'enable'}
                                                            onChange={() => updateStatusBrand(category?.id, category?.state)}
                                                            name="checkedB"
                                                            color="primary"
                                                        />
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                <EditIcon
                                                onClick={() => navigate(PATH.CATEGORY + '/' + category?.id)}
                                                    style={{
                                                        fontSize: '28px', background: 'transparent', padding: '5px',
                                                        borderRadius: '50%', border: '1px solid var(--main-color)',
                                                        color: 'var(--main-color)', cursor: 'pointer', marginRight: '7px'
                                                    }} />
                                                <VisibilityIcon
                                                    onClick={() => showDetailUser(category?.id)}
                                                    style={{
                                                        fontSize: '28px', background: 'transparent', padding: '5px',
                                                        borderRadius: '50%', border: '1px solid var(--main-color)',
                                                        color: 'var(--main-color)', cursor: 'pointer'
                                                    }} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 15]}
                            component="div"
                            labelRowsPerPage='Hiển thị:'
                            count={totalAmount}
                            rowsPerPage={size}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeSize}
                        />
                    </Paper>
                </div>
            </div>
            <div style={{ position: 'fixed', bottom: '0', left: '0', width: 'calc(100% - 260px)', marginLeft: '260px' }}>
                <Footer />
            </div>

            {/* detail modal */}
            <Modal
                open={openDetail}
                onClose={handleClose}
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description">
                <div>
                    <CategoryDetailManagement id={categoryIdDetail} handleClose={handleClose}></CategoryDetailManagement>
                </div>
            </Modal>
        </div>
    )
}

export default CategoryManagement;