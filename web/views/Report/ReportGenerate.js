import React, {Component} from 'react';
import Select from 'react-select';
import {Line} from 'react-chartjs-2';
import {
    Button,
    Card,
    CardBody,
    CardGroup,
    CardHeader,
    Col,
    Form,
    FormGroup,
    Input,
    Label,
    Progress,
    Row,
    Table
} from 'reactstrap';
import moment from 'moment';
import axios from "axios";
import Widget04 from '../Widgets/Widget04';
import * as HttpStatus from "http-status-codes/index";
import html2canvas from 'html2canvas';
//import domtoimage from 'dom-to-image';
import DatePicker from 'react-datepicker';

const jsPDF = require('jspdf');

const brandPrimary = '#20a8d8';
const brandSuccess = '#4dbd74';
const brandInfo = '#63c2de';
const brandWarning = '#f8cb00';
const brandDanger = '#f86c6b';

// Card Chart 2
const cardChartData2 = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    datasets: [
        {
            label: 'My First dataset',
            backgroundColor: brandInfo,
            borderColor: 'rgba(255,255,255,.55)',
            data: [1, 18, 9, 17, 34, 22, 11],
        },
    ],
};

const cardChartOpts2 = {
    maintainAspectRatio: false,
    legend: {
        display: false,
    },
    scales: {
        xAxes: [
            {
                gridLines: {
                    color: 'transparent',
                    zeroLineColor: 'transparent',
                },
                ticks: {
                    fontSize: 2,
                    fontColor: 'transparent',
                },

            }],
        yAxes: [
            {
                display: false,
                ticks: {
                    display: false,
                    min: Math.min.apply(Math, cardChartData2.datasets[0].data) - 5,
                    max: Math.max.apply(Math, cardChartData2.datasets[0].data) + 5,
                },
            }],
    },
    elements: {
        line: {
            tension: 0.00001,
            borderWidth: 1,
        },
        point: {
            radius: 4,
            hitRadius: 10,
            hoverRadius: 4,
        },
    },
};

// convert Hex to RGBA
function convertHex(hex, opacity) {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    var g = parseInt(hex.substring(2, 4), 16);
    var b = parseInt(hex.substring(4, 6), 16);

    var result = 'rgba(' + r + ',' + g + ',' + b + ',' + opacity / 100 + ')';
    return result;
}

const mainChartOpts = {
    maintainAspectRatio: false,
    legend: {
        display: true,
    },
    scales: {
        xAxes: [
            {
                gridLines: {
                    drawOnChartArea: false,
                },
            }],
        yAxes: [
            {
                ticks: {
                    beginAtZero: true,
                    maxTicksLimit: 5,
                    //stepSize: Math.ceil(250 / 5),
                    //max: 250,
                },
            }],
    },
    elements: {
        point: {
            radius: 0,
            hitRadius: 10,
            hoverRadius: 4,
            hoverBorderWidth: 3,
        },
    },
};

class ReportGenerate extends Component {
    constructor(props) {
        super(props);

        this.state = {
            fromDate: moment(new Date()).subtract(1, 'week'),
            toDate: moment(new Date()),
            visitUser: {
                total: 0,
                member: 0,
                mRatio: 0,
                customer: 0,
                cRatio: 0,
                return: 0,
                rRatio: 0,
                new: 0,
                nRatio: 0
            },
            visitChangeChart: {
                labels: [],
                datasets: []
            },
            topPage: [],
            signupChart: {
                labels: [],
                datasets: [{data: [1]}]
            },
            purchaseChart: {
                labels: [],
                datasets: [{data: [1]}]
            },
            purchase: [],
            title: '',
            desc: ''
        };
    }

    componentDidMount() {
        this.fetchVisitUser();
        this.fetchVisitChange();
        this.fetchTopPage();
        this.fetchSignUp();
        this.fetchPurchase();
    }

    fetchPurchase = () => {
        const {fromDate, toDate} = this.state;

        axios({
            method: 'post',
            url: '/activity/purchase',
            data: {
                fromDate: fromDate.format('YYYY-MM-DD') + '||/d',
                toDate: toDate.format('YYYY-MM-DD') + '||/d',
                timeZone: moment.tz.guess(),
                format: "yyyy-MM-dd"
            }
        }).then(
            (response) => {
                if (response.data == null) {
                    this.setState({purchase: []});
                    return
                }
                this.setState({purchase: response.data});
            },
            (err) => {
                console.log(err);
                if (err.response.status === HttpStatus.UNAUTHORIZED) {
                    this.props.history.push('/login');
                }
            }
        )
    };


    fetchSignUp = () => {
        const {fromDate, toDate} = this.state;

        axios({
            method: 'post',
            url: '/activity/summary/sign_up',
            data: {
                fromDate: fromDate.format('YYYY-MM-DD') + '||/d',
                toDate: toDate.format('YYYY-MM-DD') + '||/d',
                timeZone: moment.tz.guess(),
                format: ""
            }
        }).then(
            (response) => {
                console.log(response);
                if (response.data.first_visit !== 0 || response.data.return_visit !== 0) {
                    this.setState({
                        signupChart: {
                            labels: [
                                'First Visit',
                                'Return Visit'
                            ],
                            datasets: [
                                {
                                    data: [response.data.first_visit, response.data.return_visit],
                                    backgroundColor: [
                                        '#FF6384',
                                        '#36A2EB',
                                        '#FFCE56',
                                    ],
                                    hoverBackgroundColor: [
                                        '#FF6384',
                                        '#36A2EB',
                                        '#FFCE56',
                                    ],
                                }],
                        }
                    });
                }
            },
            (err) => {
                console.log(err);
                if (err.response.status === HttpStatus.UNAUTHORIZED) {
                    this.props.history.push('/login');
                }
            }
        )
    };

    fetchTopPage = () => {
        const {fromDate, toDate} = this.state;

        axios({
            method: 'post',
            url: '/activity/summary/top_page',
            data: {
                fromDate: fromDate.format('YYYY-MM-DD') + '||/d',
                toDate: toDate.format('YYYY-MM-DD') + '||/d',
                timeZone: moment.tz.guess(),
                format: ""
            }
        }).then(
            (response) => {
                console.log(response);
                if (response.data === null) {
                    this.setState({topPage: []});
                    return;
                }
                this.setState({topPage: response.data})
            },
            (err) => {
                console.log(err);
                if (err.response.status === HttpStatus.UNAUTHORIZED) {
                    this.props.history.push('/login');
                }
            }
        )

    };


    fetchVisitChange = () => {
        const {fromDate, toDate} = this.state;
        const chartDatas = {
            labels: [],
            datasets: [
                {
                    label: 'A Customer + A Member',
                    backgroundColor: convertHex(brandInfo, 10),
                    borderColor: brandInfo,
                    pointHoverBackgroundColor: '#fff',
                    borderWidth: 2,
                    data: null,
                },
                {
                    label: 'NEW USERS',
                    backgroundColor: 'transparent',
                    borderColor: brandSuccess,
                    pointHoverBackgroundColor: '#fff',
                    borderWidth: 2,
                    data: null,
                },
                {
                    label: 'RETURNING USERS',
                    backgroundColor: 'transparent',
                    borderColor: brandDanger,
                    pointHoverBackgroundColor: '#fff',
                    borderWidth: 2,
                    data: null,
                }
            ]
        };

        let format = 'yyyy-MM-dd';
        let keyFormat = "MM-DD";
        let interval = '1d';

        let duration = moment.duration(toDate.diff(fromDate));
        let days = duration.asDays();
        let itr = moment(moment(toDate).subtract(days, 'days').format('YYYY-MM-DD HH:mm')).twix(moment(toDate).format('YYYY-MM-DD HH:mm')).iterate("days");

        chartDatas.labels = [];

        while (itr.hasNext()) {
            chartDatas.labels.push(itr.next().format(keyFormat));
        }

        axios({
            method: 'post',
            url: '/activity/summary/visit_change',
            data: {
                fromDate: fromDate.format('YYYY-MM-DD') + '||/d',
                toDate: toDate.format('YYYY-MM-DD') + '||/d',
                format: format,
                interval: interval,
                timeZone: moment.tz.guess()
            }
        }).then(
            (response) => {
                //console.log(response);
                const total = [];
                const n = [];
                const r = [];
                for (let i = 0; i < chartDatas.labels.length; i++) {
                    total.push(0);
                    n.push(0);
                    r.push(0);
                }

                if (response.data.key !== null) {
                    response.data.key.map((k, i) => {
                        const label = moment(k).format(keyFormat);
                        const labelIndex = chartDatas.labels.indexOf(label);
                        if (labelIndex != -1) {
                            total[labelIndex] = response.data.total[i];
                            n[labelIndex] = response.data.new[i];
                            r[labelIndex] = response.data.return[i];
                        }
                    });
                }
                chartDatas.datasets[0].data = total;
                chartDatas.datasets[1].data = n;
                chartDatas.datasets[2].data = r;

                this.setState({visitChangeChart: chartDatas});
            },
            (err) => {
                console.log(err);
                if (err.response.status === HttpStatus.UNAUTHORIZED) {
                    this.props.history.push('/login');
                }
            }
        )
    };

    fetchVisitUser = () => {
        const {fromDate, toDate} = this.state;

        axios({
            method: 'post',
            url: '/activity/summary/visit_user',
            data: {
                fromDate: fromDate.format('YYYY-MM-DD') + '||/d',
                toDate: toDate.format('YYYY-MM-DD') + '||/d',
                timeZone: moment.tz.guess(),
                format: ""
            }
        }).then(
            (response) => {
                console.log(response);
                let visitUser = response.data;
                visitUser.mRatio = visitUser.total == 0 ? 0 : (visitUser.member / visitUser.total * 100).toFixed(2);
                visitUser.cRatio = visitUser.total == 0 ? 0 : (visitUser.customer / visitUser.total * 100).toFixed(2);

                visitUser.nRatio = visitUser.total == 0 ? 0 : (visitUser.new / visitUser.total * 100).toFixed(2);
                visitUser.rRatio = visitUser.total == 0 ? 0 : (visitUser.return / visitUser.total * 100).toFixed(2);

                this.setState({visitUser: visitUser})
            },
            (err) => {
                console.log(err);
                if (err.response.status === HttpStatus.UNAUTHORIZED) {
                    this.props.history.push('/login');
                }
            }
        )

    };

    renderTopPage() {
        const {topPage} = this.state;
        const tdStyle = {textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap'};

        if (topPage.length == 0) {
            return (
                <tr>
                    <td colSpan={6} style={{textAlign: 'center'}}>No data.</td>
                </tr>
            )
        } else {
            return (
                topPage.map((row, i) =>
                    <tr key={i}>
                        <td>{i + 1}</td>
                        <td title={row.page} style={tdStyle}>{row.page}</td>
                        <td>{row.desc}</td>
                        <td>{row.count}</td>
                        <td>{row.ratio}</td>
                        <td><Progress className="progress-sm mt-2" color="danger" value={row.ratio}/></td>
                    </tr>
                )
            )
        }
    }

    renderPurchase() {
        const {purchase} = this.state;
        const tdStyle = {
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            paddingTop: 5 + 'px',
            paddingBottom: 5 + 'px'
        };

        return (
            <tbody>
            {purchase.map((v, i) =>
                <tr>
                    <td style={tdStyle}>{i+1}</td>
                    <td style={tdStyle}>{v.item}</td>
                    <td style={tdStyle}>{v.customer}</td>
                    <td style={tdStyle}>{v.member}</td>
                    <td style={tdStyle}>{v.pc}</td>
                    <td style={tdStyle}>{v.mobile}</td>
                    <td style={tdStyle}>{v.amount}</td>
                </tr>
            )}
            </tbody>
        )
    }

    exportPdf = () => {
        const exportReport = document.getElementById("exportReport");
        html2canvas(exportReport).then(canvas => {
            let png = canvas.toDataURL("image/png",1.0);

            const pdf_instance = new jsPDF('p', 'mm', 'a3');

            let width = pdf_instance.internal.pageSize.getWidth();
            let height = pdf_instance.internal.pageSize.getHeight();
            pdf_instance.addImage(png, 'png', 5, 5, width - 10, height - 10);
            pdf_instance.save("report.pdf");

        });
    };

    handleFromDateChange = (date) => {
        this.setState({fromDate: date})
    };

    handleToDateChange = (date) => {
        this.setState({toDate: date})
    };

    handleTitleChange = (e) => {
        this.setState({title: e.target.value})
    };

    handleDescChange = (e) => {
        this.setState({desc: e.target.value})
    };

    handleClickCreateBtn = () => {
        this.fetchVisitUser();
        this.fetchVisitChange();
        this.fetchTopPage();
        this.fetchSignUp();
        this.fetchPurchase();
    };

    render() {
        const options = [
            {value: '1', label: 'PlaSkin'},
            {value: '2', label: 'PlaSkin Plus'},
            {value: '3', label: 'PlaBeau'}
        ];
        const {visitUser, visitChangeChart, fromDate, toDate, title, desc} = this.state;
        return (
            <div className="animated fadeIn">
                <Row>
                    <Col xs="12" lg="12">
                        <Card style={{marginBottom: 15 + 'px'}}>
                            <CardHeader>
                                <Form inline>
                                    <FormGroup className="pr-1">
                                        <Label htmlFor="exampleInputEmail2" className="pr-1">Title</Label>
                                        <Input type="text" id="exampleInputEmail2" onChange={this.handleTitleChange}
                                               required/>
                                    </FormGroup>
                                    <FormGroup className="pr-1">
                                        <Label htmlFor="exampleInputName2" className="pr-1">Report for User
                                            Activity</Label>
                                        <DatePicker className="form-control" selected={fromDate}
                                                    onChange={this.handleFromDateChange} dateFormat="YYYY-MM-DD"/>
                                        ~
                                        <DatePicker className="form-control" selected={toDate}
                                                    onChange={this.handleToDateChange} dateFormat="YYYY-MM-DD"/>
                                    </FormGroup>
                                    <FormGroup className="pr-1">
                                        <Label htmlFor="exampleInputEmail2" className="pr-1">Description</Label>
                                        <Input type="text" id="exampleInputEmail2" onChange={this.handleDescChange}/>
                                    </FormGroup>
                                </Form>
                                <Form inline className="mt-2">
                                    <FormGroup className="pr-1" style={{width: 75 + '%'}}>
                                        <Label htmlFor="exampleInputEmail2" className="pr-1">Include custom
                                            information</Label>
                                        <div style={{width: 60 + '%'}}>
                                            <Select isMulti options={options}
                                                    defaultValue={{value: '1', label: 'PlaSkin'}}/>
                                        </div>
                                    </FormGroup>
                                    <Button size="sm" color="primary" className="mr-1" style={{marginLeft: 'auto'}}
                                            onClick={this.handleClickCreateBtn}><i
                                        className="fa fa-dot-circle-o"></i>Create & View</Button>
                                    <Button size="sm" color="primary" className="mr-1"><i
                                        className="fa fa-dot-circle-o"></i>Add Report</Button>
                                    <Button outline={true} size="sm" color="primary" onClick={this.exportPdf}><i
                                        className="fa fa-file-pdf-o"></i>Save PDF</Button>
                                </Form>
                            </CardHeader>
                        </Card>
                    </Col>
                </Row>
                <div id="exportReport">
                    <Card className='border-0'>
                        <CardBody className='p-0'>
                            <Table responsive className='m-0'>
                                <thead>
                                <tr>
                                    <th>Title :</th>
                                    <th>{title}</th>
                                    <th style={{width: 200 + 'px'}}>Report for User Activity :</th>
                                    <th>{moment(fromDate).format('YYYY-MM-DD') + ' ~ ' + moment(toDate).format('YYYY-MM-DD')}</th>
                                </tr>
                                <tr>
                                    <th style={{width: 120 + 'px'}}>Description :</th>
                                    <th colSpan={3}>{desc}</th>
                                </tr>
                                </thead>
                            </Table>
                        </CardBody>
                    </Card>
                    <Row>
                        <Col xs="12" sm="4" lg="4">
                            <Card className="text-white bg-info" style={{marginBottom: 0, height: 164 + 'px'}}>
                                <CardBody className="pb-0">
                                    <h4 className="mb-0">{visitUser.total}</h4>
                                    <p>A Customer + A Member</p>
                                </CardBody>
                                <div className="chart-wrapper px-3" style={{height: '70px'}}>
                                    <Line data={cardChartData2} options={cardChartOpts2} height={70}/>
                                </div>
                            </Card>
                        </Col>
                        <Col xs="12" sm="4" lg="4">
                            <CardGroup className="mb-4">
                                <Widget04 icon="icon-people" color="info" header={visitUser.member}
                                          value={visitUser.mRatio}>A Member</Widget04>
                                <Widget04 icon="icon-user-follow" color="success" header={visitUser.customer}
                                          value={visitUser.cRatio}>A Customer</Widget04>
                            </CardGroup>
                        </Col>
                        <Col xs="12" sm="4" lg="4">
                            <CardGroup className="mb-4">
                                <Widget04 icon="icon-people" color="info" header={visitUser.return}
                                          value={visitUser.rRatio}>Returning Users</Widget04>
                                <Widget04 icon="icon-user-follow" color="success" header={visitUser.new}
                                          value={visitUser.nRatio}>New Users</Widget04>
                            </CardGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs="12" sm="12" lg="12">
                            <Card>
                                <CardHeader style={{height: 46 + 'px'}}>
                                    <Row>
                                        <Col sm="5">
                                            <span className="mb-0"><strong>A Customer + A Member</strong></span>
                                        </Col>
                                    </Row>
                                </CardHeader>
                                <CardBody>
                                    <div className="chart-wrapper" style={{height: 300 + 'px'}}>
                                        <Line data={visitChangeChart} options={mainChartOpts} height={300}/>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>

                    <Row>
                        <Col xs="12" sm="12" lg="12">
                            <Card>
                                <CardHeader style={{height: 46 + 'px'}}>
                                    <Row>
                                        <Col sm="5">
                                            <span className="mb-0"><strong>Top Popular Pages - All Users</strong></span>
                                        </Col>
                                    </Row>
                                </CardHeader>
                                <CardBody>
                                    <div className="chart-wrapper">
                                        <Table responsive style={{margin: 0}}>
                                            <colgroup>
                                                <col width="10%"/>
                                                <col/>
                                                <col width="10%"/>
                                                <col width="10%"/>
                                                <col width="10%"/>
                                                <col width="30%"/>
                                            </colgroup>
                                            <thead>
                                            <tr>
                                                <th>No</th>
                                                <th>Page Name</th>
                                                <th>Description</th>
                                                <th>Count</th>
                                                <th>Rate(%)</th>
                                                <th></th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {this.renderTopPage()}
                                            </tbody>
                                        </Table>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>

                    <Row>
                        <Col xs="12" sm="12" lg="12">
                            <Card>
                                <CardHeader style={{height: 46 + 'px'}}>
                                    <Row>
                                        <Col sm="5">
                                            <span className="mb-0"><strong>Purchases</strong></span>
                                        </Col>
                                    </Row>
                                </CardHeader>
                                <CardBody>
                                    <Table striped bordered style={{tableLayout: 'fixed'}}>
                                        <colgroup>
                                            <col style={{width: '5%'}}/>
                                            <col style={{width: '25%'}}/>
                                            <col/>
                                            <col/>
                                            <col/>
                                            <col/>
                                            <col/>
                                        </colgroup>
                                        <thead>
                                        <tr>
                                            <th style={{
                                                verticalAlign: 'middle',
                                                padding: 6 + 'px',
                                                textAlign: 'center'
                                            }} rowSpan={2}>No
                                            </th>
                                            <th style={{
                                                verticalAlign: 'middle',
                                                padding: 6 + 'px',
                                                textAlign: 'center'
                                            }} rowSpan={2}>Item
                                            </th>
                                            <th style={{
                                                verticalAlign: 'middle',
                                                padding: 6 + 'px',
                                                textAlign: 'center'
                                            }} colSpan={2}>Type/User
                                            </th>
                                            <th style={{
                                                verticalAlign: 'middle',
                                                padding: 6 + 'px',
                                                textAlign: 'center'
                                            }} colSpan={2}>Type/Device
                                            </th>
                                            <th style={{
                                                verticalAlign: 'middle',
                                                padding: 6 + 'px',
                                                textAlign: 'center'
                                            }} rowSpan={2}>Amount($)
                                            </th>
                                        </tr>
                                        <tr>
                                            <th style={{
                                                verticalAlign: 'middle',
                                                padding: 6 + 'px',
                                                textAlign: 'center'
                                            }}>A Customer(%)
                                            </th>
                                            <th style={{
                                                verticalAlign: 'middle',
                                                padding: 6 + 'px',
                                                textAlign: 'center'
                                            }}>A Member(%)
                                            </th>
                                            <th style={{
                                                verticalAlign: 'middle',
                                                padding: 6 + 'px',
                                                textAlign: 'center'
                                            }}>PC
                                            </th>
                                            <th style={{
                                                verticalAlign: 'middle',
                                                padding: 6 + 'px',
                                                textAlign: 'center'
                                            }}>Mobile
                                            </th>
                                        </tr>
                                        </thead>
                                        {this.renderPurchase()}
                                    </Table>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </div>
        )
    }
}

export default ReportGenerate;
