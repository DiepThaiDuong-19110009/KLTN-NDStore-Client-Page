import { useEffect, useState } from "react";
import Footer from "../../components/Footer/Footer";
import Header from "../../components/Header/Header";
import '../ProductDetail/ProductDetail.css'
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from "@mui/material";
import { getProductDetailById } from "../../apis/product.api";
import { useNavigate, useParams } from "react-router-dom";
import { addProductToCart } from "../../apis/cart.api";
import { Loader } from "../../components/Loader/Loader";
import { useDispatch } from "react-redux";
import { actionCartRequest } from "../../redux/actions/ActionsCart";

const ProductDetail = () => {
    const [srcImg, setSrcImg] = useState('')
    const [openComment, setOpenComment] = useState(false);
    const [contentComment, setContentComment] = useState('')
    const [isLoading, setIsLoading] = useState(false);

    const [productDetail, setProductDetail] = useState({})

    const dispatch = useDispatch()

    const navigate = useNavigate()

    let { id } = useParams()

    const handleClickOpen = () => {
        setOpenComment(true);
    };

    const handleClose = () => {
        setOpenComment(false);
        setContentComment('')
    };

    useEffect(() => {
        getProductDetail(id)
    }, [id])

    const numberWithCommas = (x) => {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    const getImage = (src) => {
        setSrcImg(src);
    }

    const sendComment = () => {
        console.log(contentComment)
    }

    const getProductDetail = (id) => {
        setIsLoading(true)
        getProductDetailById(id)
            .then((res) => {
                if (res) {
                    setIsLoading(false)
                    setProductDetail(res?.data?.data)
                    setSrcImg(res?.data?.data?.images[0]?.url)
                }
            })
            .catch((err) => {
                if (err) {
                    console.log(err)
                    setIsLoading(false)
                }
            })
    }

    const addToCart = (stock) => {
        if (stock === 0) {
            return;
        }
        setIsLoading(true)
        addProductToCart(id, 1)
            .then((res) => {
                if (res?.data?.success === true) {
                    dispatch(actionCartRequest())
                    getProductDetail(id)
                    setIsLoading(false)
                }
            })
            .catch((err) => {
                if (err) {
                    console.log(err)
                    setIsLoading(false)
                }
            })
    }

    return (
        <div style={{ position: 'relative' }}>
            <Header></Header>
            {
                isLoading === true && <Loader></Loader>
            }
            <div className="container-product-detail">
                <button style={{ background: 'var(--main-color)', border: 'none', padding: '10px', color: '#FFFFFF', borderRadius: '5px' }}
                     onClick={() => navigate(-1)} className="add-to-cart">
                    <i style={{ marginRight: '10px' }} className="fas fa-arrow-left"></i>Tiếp tục mua hàng
                </button>
            </div>
            <div className="container-product-detail">
                <div className="product-detail">
                    <div className="imgae-product">
                        <img alt="img-product" src={srcImg}></img>
                        <div className="list-detail-imgage">
                            {
                                productDetail?.images?.map((img) => {
                                    return (
                                        <img key={img?.id_image} alt={img?.id_image} onClick={() => getImage(img.url)} src={img?.url}></img>
                                    )
                                })
                            }
                        </div>
                    </div>
                    <div className="image-info-detail">
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <h3 style={{ marginRight: '10px' }}>{productDetail?.name}</h3><span>(Đã bán {productDetail?.sold} sản phẩm)</span>
                        </div>
                        <div>
                            {
                                productDetail?.stock === 0 ?
                                    <p>Tình trạng: <strong style={{ color: 'red' }}>Hết hàng</strong></p> :
                                    <p>Tình trạng: <strong style={{ color: 'green' }}>Còn hàng</strong></p>
                            }
                        </div>
                        <p style={{ marginTop: '10px' }}>Thương hiệu: <strong style={{ color: 'var(--main-color)' }}>{productDetail?.nameBrand}</strong></p>
                        <div>
                            <h2 style={{ color: 'var(--main-color)', marginTop: '5px' }} className='price'>{numberWithCommas(parseInt(productDetail?.discountPrice))} VNĐ</h2>
                            <div style={{ display: 'flex' }}>
                                <p style={{ textDecoration: 'line-through', marginRight: '10px' }}>{numberWithCommas(parseInt(productDetail?.originPrice))} VNĐ</p>
                                <p style={{ color: 'var(--main-color)' }}>{productDetail?.discount}%</p>
                            </div>
                        </div>
                        <hr />
                        <div>
                            <h5>Thông số sản phẩm</h5>
                            <ul>
                                <li>CPU: Intel Core i3-1115G4</li>
                                <li>Màn hình: 14" (1920 x 1080)</li>
                                <li>RAM: 1 x 4GB Onboard DDR4 2666MHz</li>
                                <li style={{ listStyle: 'none', marginTop: '10px' }}>. . . <span style={{ marginLeft: '10px', color: 'var(--main-color)', cursor: 'pointer' }}>Xem thông tin chi tiết</span></li>
                            </ul>
                        </div>
                        <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between', gap: '30px' }}>
                            <button className="view-comment" onClick={handleClickOpen}>Xem đánh giá sản phẩm</button>
                            <button style={{ background: productDetail?.stock === 0 ? '#009ed469' : 'var(--main-color)' }}
                                disabled={productDetail?.stock === 0} onClick={() => addToCart(productDetail?.stock)} className="add-to-cart">
                                <i style={{ marginRight: '10px' }} className="fas fa-cart-plus"></i>Thêm vào giỏ hàng
                            </button>
                        </div>
                    </div>
                </div>
                <div className="policy">
                    <h5>Chính sách bán hàng</h5>
                    <span><i className="fas fa-shield-alt"></i>Cam kết hàng chính hãng</span><br />
                    <span><i className="fas fa-shipping-fast"></i>Giao hàng trên toàn quốc</span><br />
                    <span><i className="fas fa-headset"></i>Hỗ trợ đổi trả</span>
                </div>
            </div>
            <div className="container-product-detail">
                <div className="detail-infor-product">
                    <h4>Mô tả sản phẩm</h4>
                    <p>
                        Laptop Asus X415EA-EK675W gọn nhẹ sẵn sàng đồng hành cùng bạn trong công việc và học tập. Kết hợp hiệu năng mạnh mẽ từ chip Intel Core i3 thế hệ thứ 11, chiếc laptop trên sẽ là lựa chọn tuyệt vời trong phân khúc giá rẻ, đáp ứng tốt nhu cầu của học sinh, sinh viên, nhân viên văn phòng...
                    </p>
                    <strong>
                        Kiểu dáng nhỏ gọn thanh lịch, trải nghiệm màn hình Full HD sắc nét
                        Asus X415EA-EK675W khoác lên vẻ ngoài mỏng gọn với trọng lượng 1.6 kg và độ dày 1.99 cm, dễ dàng nằm gọn trong balo, túi xách của người dùng, Tính di động cao cho phép chiếc laptop sẵn sàng theo chân bạn đến bất kỳ đâu. Thiết kế màu bạc sang trọng tôn lên nét đẹp thanh lịch tinh tế.
                    </strong><br />
                    <img style={{ margin: '20px 0' }} alt="" src="https://storage.googleapis.com/teko-gae.appspot.com/media/image/2022/7/4/20220704_87e3dfd7-03c0-4d78-87d2-9f5c9400f2de.jpg"></img>
                    <br />
                    <strong>
                        Màn hình 14 inch mang đến trải nghiệm xem chân thực hơn nhờ thiết kế viền mỏng. Độ phân giải Full HD (1920 x 1080P), mang đến khung hình sắc nét và sống động. Tính năng chống lóa cho phép bạn thoải mái làm việc và học tập với chiếc laptop ngay cả trong điều kiện ánh sáng mạnh.
                    </strong>
                    <img style={{ margin: '20px 0' }} alt="" src="https://storage.googleapis.com/teko-gae.appspot.com/media/image/2022/7/4/20220704_87e3dfd7-03c0-4d78-87d2-9f5c9400f2de.jpg"></img>
                    <br />
                </div>
            </div>
            <Dialog fullWidth open={openComment} onClose={handleClose}>
                <DialogTitle>Đánh giá sản phẩm</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Vui lòng đánh giá sản phẩm.
                    </DialogContentText>
                    <textarea value={contentComment} onChange={(e) => setContentComment(e.target.value)} className="text-area-comment"></textarea>
                    <DialogActions>
                        <Button onClick={handleClose}>Hủy</Button>
                        <Button disabled={!contentComment ? true : false} onClick={sendComment}>Gửi đánh giá</Button>
                    </DialogActions>
                    <div className="last-comment">
                        <h5 style={{ marginBottom: '20px' }}>Các đánh giá trước đó <span style={{ color: 'var(--main-color)' }}>(5)</span></h5>
                        <div style={{ boxShadow: '1px 2px 10px rgb(224, 224, 224)', padding: '10px', marginTop: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQAp-kUfbmEzt3HLLzgNOoQjCsz-mywoifMg&usqp=CAU" alt="" className="avatar-comment"></img>
                                <div>
                                    <strong>Duong Diep</strong><br />
                                    <small style={{ margin: 0 }}>20/07/2023 13:40</small>
                                </div>
                            </div>
                            <p style={{ marginTop: '10px' }}>Sản phẩm tạm ổn</p>
                        </div>
                        <div style={{ boxShadow: '1px 2px 10px rgb(224, 224, 224)', padding: '10px', marginTop: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQAp-kUfbmEzt3HLLzgNOoQjCsz-mywoifMg&usqp=CAU" alt="" className="avatar-comment"></img>
                                <div>
                                    <strong>Duong Diep</strong><br />
                                    <small style={{ margin: 0 }}>20/07/2023 13:40</small>
                                </div>
                            </div>
                            <p style={{ marginTop: '10px' }}>Sản phẩm tạm ổn</p>
                        </div>
                        <div style={{ boxShadow: '1px 2px 10px rgb(224, 224, 224)', padding: '10px', marginTop: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQAp-kUfbmEzt3HLLzgNOoQjCsz-mywoifMg&usqp=CAU" alt="" className="avatar-comment"></img>
                                <div>
                                    <strong>Duong Diep</strong><br />
                                    <small style={{ margin: 0 }}>20/07/2023 13:40</small>
                                </div>
                            </div>
                            <p style={{ marginTop: '10px' }}>Sản phẩm tạm ổn</p>
                        </div>
                        <div style={{ boxShadow: '1px 2px 10px rgb(224, 224, 224)', padding: '10px', marginTop: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQAp-kUfbmEzt3HLLzgNOoQjCsz-mywoifMg&usqp=CAU" alt="" className="avatar-comment"></img>
                                <div>
                                    <strong>Duong Diep</strong><br />
                                    <small style={{ margin: 0 }}>20/07/2023 13:40</small>
                                </div>
                            </div>
                            <p style={{ marginTop: '10px' }}>Sản phẩm tạm ổn</p>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
            <Footer></Footer>
        </div>
    )
}

export default ProductDetail;