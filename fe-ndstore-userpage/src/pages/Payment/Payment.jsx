import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import '../Payment/Payment.css'
import logoPayPal from '../../images/paypal.svg'
import logoVNPay from '../../images/Logo-VNPAY-1.png'
import { useEffect, useState } from "react";
import { getDistrict, getFee, getLeadTime, getProvince, getServiceId, getWard } from "../../apis/logictis.api";
import { useNavigate } from "react-router-dom";
import { getProfileUser } from "../../apis/user.api";
import { Loader } from "../../components/Loader/Loader";
import getCartProductUser from "../../apis/cart.api";
import { checkout } from "../../apis/checkout.api";
const Payment = () => {
    const userId = JSON.parse(localStorage.getItem('user-infor'))?.id
    const [chooseMethod, setChooseMethod] = useState('')
    const [isLoading, setIsLoading] = useState(false);
    const [cart, setCart] = useState([])
    const [totalPrice, setTotalrice] = useState(0)
    const [idCart, setIdCart] = useState('')

    // Get Address
    const [province, setProvince] = useState([])
    const [district, setDistrict] = useState([])
    const [ward, setWard] = useState([])
    const [provinceId, setProvinceId] = useState('')
    const [districtId, setDistrictId] = useState('')
    const [wardId, setWardId] = useState('')
    const [leadTime, setLeadTime] = useState('')
    const [fee, setFee] = useState(0)
    const [message, setMessage] = useState('')

    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const [address, setAddress] = useState('')
    const [note, setNote] = useState('')

    let navigate = useNavigate();

    const numberWithCommas = (x) => {
        return x?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    useEffect(() => {
        getProvinceList();
    }, [])

    useEffect(() => {
        if (!localStorage.getItem('access-token')) {
            navigate('/');
        } else {
            getAllCart();
            getUserDetail(userId)
        }
    }, [userId])

    // Get list of province, district, ward
    const getProvinceList = () => {
        getProvince()
            .then((res) => {
                setProvince(res?.data?.data)
            })
            .catch((err) => {
                return err;
            })
    }
    const getDistrictList = (provinceId) => {
        getDistrict(provinceId)
            .then((res) => {
                setDistrict(res?.data?.data)
            })
            .catch((err) => {
                return err;
            })
    }
    const getWardList = (districtId) => {
        getWard(districtId)
            .then((res) => {
                setWard(res?.data?.data)
            })
            .catch((err) => {
                return err;
            })
    }

    // Get Id of province, district, ward
    const getProvinceId = (e) => {
        setMessage("");
        setProvinceId(e);
        setDistrict([]);
        setDistrictId('');
        getDistrictList(e);
    }

    const getDistrictId = (e) => {
        setMessage("");
        setDistrictId(e);
        setWard([]);
        setWardId('');
        getWardList(e);
    }

    const getWardId = (e) => {
        if (!e) {
            return;
        }
        console.log('wardId', e)
        getIdService(districtId, e)
        setMessage("")
        setWardId(e)
        getFeeShipment(provinceId, districtId, e)
        getServiceId(districtId)
    }

    const getNameProvinceById = (ProvinceId) => {
        let provinceName = ''
        province?.forEach((item) => {
            if(item?.ProvinceID === parseInt(ProvinceId)) {
                provinceName = item?.ProvinceName
            }
        })
        return provinceName;
    }

    const getNameDistrictById = (DistrictID) => {
        let DistrictName = ''
        district?.forEach((item) => {
            if(item?.DistrictID === parseInt(DistrictID)) {
                DistrictName = item?.DistrictName
            }
        })
        return DistrictName;
    }

    const getNameWardById = (WardID) => {
        let WardName = ''
        ward?.forEach((item) => {
            if(item?.WardCode === WardID.toString()) {
                WardName = item?.WardName
            }
        })
        return WardName;
    }

    // Get user info
    const getUserDetail = (userId) => {
        if (!userId) {
            navigate('/')
            return;
        }
        setIsLoading(true);
        getProfileUser(userId)
            .then((res) => {
                if (res.status === 200) {
                    setIsLoading(false);
                    setName(res?.data?.data?.name)
                    setPhone(res?.data?.data?.phone)
                    setAddress(res?.data?.data?.address)
                    setProvinceId(res?.data?.data?.province)
                    getDistrictList(res?.data?.data?.province)
                    setDistrictId(res?.data?.data?.district)
                    getWardList(res?.data?.data?.district)
                    setWardId(res?.data?.data?.ward)
                    getFeeShipment(res?.data?.data?.province, res?.data?.data?.district, res?.data?.data?.ward?.toString())
                    getIdService(res?.data?.data?.district, res?.data?.data?.ward)
                }
            })
            .catch((err) => {
                setIsLoading(false);
                return err;
            })
    }

    // Set method payment
    const setMethodPayment = (method) => {
        setMessage('')
        let elems = document.getElementsByClassName('choose-method');
        for (let i = 0, l = elems.length; i < l; i++)
            elems[i].style.border = 'none';
        const classCheck = document.getElementsByClassName(method).length > 0;
        if (classCheck) {
            document.getElementsByClassName(method)[0].style.border = "1px solid var(--main-color)";
        }
        setChooseMethod(method)
    }

    // Get service Id
    const getIdService = (districtId, wardId) => {
        if (!districtId) {
            return;
        }
        getServiceId(districtId)
            .then((res) => {
                if (res) {
                    if (res?.data?.code === 200) {
                        getEstimateTime(districtId, wardId, res?.data?.data[0]?.service_id)
                    }
                }
            })
            .catch((err) => {
                return err;
            })
    }

    // Get LeadTime
    const getEstimateTime = (districtId, wardId, serviceId) => {
        if (!districtId || !wardId) {
            return;
        }
        getLeadTime(districtId, wardId, serviceId)
            .then((res) => {
                if (res?.data?.code === 200) {
                    setLeadTime(res?.data?.data?.leadtime)
                }
            })
            .catch((err) => {
                return err;
            })
    }

    //Get fee shiptment
    const getFeeShipment = (provinceId, districtId, wardId) => {
        if (!districtId || !wardId || !provinceId) {
            return;
        }
        getFee(provinceId, districtId, wardId)
            .then((res) => {
                if (res?.data?.code === 200) {
                    setFee(res?.data?.data?.total)
                }
            })
            .catch((err) => {
                return err;
            })
    }

    //Get cart
    const getAllCart = () => {
        setIsLoading(true)
        getCartProductUser()
            .then((res) => {
                if (res?.data?.data?.items) {
                    setIsLoading(false)
                    setIdCart(res?.data?.data?.id)
                    setCart(res?.data?.data?.items)
                    setTotalrice(res?.data?.data?.totalPrice)
                } else {
                    setCart([])
                    setTotalrice(0)
                    setIsLoading(false)
                }
            })
            .catch((err) => {
                setIsLoading(false)
                console.log(err)
            })
    }

    const payment = () => {
        if (!chooseMethod) {
            setMessage('Vui lòng chọn phương thức thanh toán');
            return;
        }
        if (!name || !phone || !address || !provinceId || !districtId || !wardId) {
            setMessage('Vui lòng cung cấp đầy đủ thông tin');
            return;
        }
        console.log(name, phone, address, getNameProvinceById(provinceId), getNameDistrictById(districtId), getNameWardById(wardId), note, fee, leadTime, idCart, chooseMethod)
        checkout(name, phone, address, getNameProvinceById(provinceId), getNameDistrictById(districtId), getNameWardById(wardId), note, Math.floor(fee / 1000) * 1000, leadTime, idCart, chooseMethod)
            .then((res) => {
                console.log(res?.data)
                if (res?.data?.success === true) {
                    if (res?.data?.data !== '') {
                        window.location.href = res?.data?.data;
                    } else if (res?.data?.data === '') {
                        window.location.href = 'http://localhost:3000/checkout/order/payment?complete=true&cancel=false';
                    }
                }
            })
            .catch((err) => {
                if (err) {
                    window.location.href = 'http://localhost:3000/checkout/order/payment?complete=false&cancel=false';
                }
            })
    }

    return (
        <div>
            <Header></Header>
            {
                isLoading === true && <Loader></Loader>
            }
            <div className="container-payment">
                {/* {
                        (cart?.length !== 0 || !cart) &&
                        <table className='cart'>
                            <tr className='header-cart-table'>
                                <th>Tên sản phẩm</th>
                                <th style={{ textAlign: 'center' }}>Hình ảnh</th>
                                <th>Đơn giá</th>
                                <th style={{ textAlign: 'right' }}>Thành tiền</th>
                            </tr>
                            {
                                cart?.map((item) => (
                                    <tr key={item?.itemCartId} className='body-cart-table'>
                                        <td style={{ wordBreak: 'break-word', maxWidth: '40px' }}>
                                            <span>{item?.productName}</span>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <img style={{ width: '80px', height: '80px', border: '1px solid rgb(224, 224, 224)', borderRadius: '5px' }} alt=''
                                                src={item?.image ? item?.image[0]?.url : ''}></img>
                                        </td>
                                        <td style={{ display: 'flex', flexDirection: 'column', marginTop: '20px' }}>
                                            <strong>{numberWithCommas(parseInt(item?.discountPrice))} VNĐ</strong>
                                            <div style={{ display: 'flex' }}>
                                                <small style={{ textDecoration: 'line-through', marginRight: '6px' }}>{numberWithCommas(parseInt(item?.productPrice))} VNĐ</small>
                                                <small style={{ color: 'var(--main-color)' }}>{item?.discount} %</small>
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <strong style={{ color: 'var(--main-color)', textAlign: 'right' }}>{numberWithCommas(parseInt(item?.discountPrice) * parseInt(item?.quantity))} VNĐ</strong>
                                        </td>
                                    </tr>
                                ))
                            }
                        </table>
                    } */}
                <div className="info-payment">
                    <h5>Phương thức thanh toán</h5>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '15px' }}>
                        <button onClick={() => setMethodPayment('paypal')} className="paypal choose-method">
                            <img style={{ height: '30px' }} src={logoPayPal} alt="" />
                        </button>
                        <button onClick={() => setMethodPayment('vnpay')} className="vnpay choose-method">
                            <img style={{ height: '30px' }} src={logoVNPay} alt="" />
                        </button>
                        <button onClick={() => setMethodPayment('cod')} className="cod choose-method">
                            <strong>Tiền mặt</strong>
                        </button>
                    </div>
                    <hr />
                    <h5>Thông tin giao hàng</h5>
                    <div className="information-delivery" style={{ display: 'flex', flexDirection: 'column' }}>
                        <label>Tên người nhận</label>
                        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tên người nhận" type="text"></input>
                        <label htmlFor="">Số điện thoại</label>
                        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Số điện thoại" type="number"></input>
                        <label htmlFor="">Địa chỉ</label>
                        <input value={address === 'unknown' ? '' : address} onChange={(e) => setAddress(e.target.value)}
                            placeholder="Số nhà, tên đường" type="text"></input>
                        <label htmlFor="">Tỉnh, Thành phố</label>
                        <select
                            onChange={(e) => getProvinceId(e.target.value)} value={provinceId}>
                            <option value=''>Tỉnh / Thành Phố</option>
                            {
                                province.map((item, index) =>
                                    <option value={item.ProvinceID} key={index}>{item?.ProvinceName}</option>
                                )
                            }
                        </select>
                        <label htmlFor="">Quận, huyện</label>
                        <select
                            onChange={(e) => getDistrictId(e.target.value)} value={districtId}>
                            <option value=''>Quận / Huyện</option>
                            {
                                district.map((item, index) =>
                                    <option value={item.DistrictID} key={index}>{item?.DistrictName}</option>
                                )
                            }
                        </select>
                        <label htmlFor="">Xã, phường</label>
                        <select
                            onChange={(e) => getWardId(e.target.value)} value={wardId}>
                            <option value=''>Xã / Phường</option>
                            {
                                ward.map((item, index) =>
                                    <option value={item.WardID} key={index}>{item?.WardName}</option>
                                )
                            }
                        </select>
                        <label>Ghi chú (không bắt buộc)</label>
                        <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ghi chú" type="text"></textarea>
                    </div>
                </div>
                <div className="total-payment">
                    <h4 style={{ marginBottom: '30px' }}>Thanh toán</h4>
                    <p>Dự kiến giao vào: <span style={{ color: 'var(--main-color)' }}>{leadTime ? new Date(leadTime * 1000).toLocaleDateString() : 0}</span></p>
                    <p>Phí giao hàng: <strong>{numberWithCommas(Math.floor(fee / 1000) * 1000)} VNĐ</strong></p>
                    <p>Thành tiền: <strong>{numberWithCommas(totalPrice)} VNĐ</strong></p>
                    <h5>Tổng thanh toán: <strong style={{ color: 'var(--main-color)' }}>{numberWithCommas(parseInt(totalPrice) + Math.floor(fee / 1000) * 1000)} VNĐ</strong></h5>
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ color: 'red', textAlign: 'center', padding: '20px 0 0 0' }}>{message}</p>
                        <button onClick={() => payment()} className='btn-payment-for-cart'>THANH TOÁN</button>
                    </div>
                </div>
            </div>
            <Footer></Footer>
        </div>
    )
}
export default Payment;