import React, {Component} from 'react';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Form,
  FormGroup,
  Input,
  Label,
  Pagination,
  PaginationItem,
  PaginationLink,
  Progress,
  Row,
  Table,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter
} from 'reactstrap';
import moment from 'moment';
import 'moment-timezone';
import axios from "axios";
import * as HttpStatus from "http-status-codes/index";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';


export default class PageView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      fromDate: moment(new Date()),
      toDate: moment(new Date()),
      rows: [],
      activePage: 1,
      totalPage: 0,
      activeBlock: 1,
      totalBlock: 0,
      keyword: "",
      modal: false,
      page: "",
      content: ""
    }
  }

  PAGE_PER_BLOCK = 5;
  ROW_PER_PAGE = 10;

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    if (this.props.selectedSite !== prevProps.selectedSite) {
      this.fetchData();
    }
  }

  popupModel = () => {
    this.setState({modal: !this.state.modal});
  };

  fetchData() {
    const {fromDate, toDate, activePage, keyword} = this.state;

    axios({
      method: 'post',
      url: '/activity/page_view',
      data: {
        fromDate: fromDate.format('YYYY-MM-DD') + '||/d',
        toDate: toDate.format('YYYY-MM-DD') + '||/d',
        timeZone: moment.tz.guess(),
        from: (activePage - 1) * 10,
        size: this.ROW_PER_PAGE,
        keyword: keyword
      }
    }).then(
        (response) => {
          console.log(response);
          if (response.data.total_page == 0) {
            this.setState({rows: []});
            return;
          }
          let totalPage = Math.ceil(response.data.total_page / this.ROW_PER_PAGE);

          this.setState({totalPage});
          this.setState({totalBlock: Math.ceil(totalPage / this.PAGE_PER_BLOCK)});
          this.setState({rows: response.data.pages})
        },
        (err) => {
          console.log(err);
          if (err.response.status === HttpStatus.UNAUTHORIZED) {
            this.props.history.push('/login');
          }
        }
    )
  }

  handleSearchClick = () => {
    this.setState({
      activePage: 1,
      totalPage: 0,
      activeBlock: 1,
      totalBlock: 0
    }, this.fetchData);
  };

  handleKeywordChange = (event) => {
    this.setState({keyword: event.target.value})
  };

  handleViewContent = (e, page, content) => {
    e.preventDefault();
    this.setState({page, content}, this.popupModel);
  }

  renderContent() {
    const {rows} = this.state;
    const tdStyle = {textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', paddingTop: 7 + 'px', paddingBottom: 7 + 'px'};

    return (
        rows.map((row) =>
            <tr>
              <td style={tdStyle}>{row.index}</td>
              <td style={tdStyle}>{row.page}</td>
              <td style={tdStyle}>{row.desc}</td>
              <td style={tdStyle}>{row.count}2</td>
              <td style={tdStyle}>{row.ratio}</td>
              <td style={tdStyle}><Progress className="progress-sm mt-2" color="danger" value={row.ratio}/></td>
              <td style={tdStyle}><a href="#" onClick={(e) => {
                this.handleViewContent(e, row.page, row.content)
              }}><i className="fa fa-search fa-lg pl-1"></i></a></td>
            </tr>
        )
    )
  }

  handlePrevBokck = () => {
    let minPage = 1 + (this.state.activeBlock - 1) * 5;
    this.setState({activeBlock: this.state.activeBlock - 1, activePage: minPage - 1}, this.fetchData)
  };

  handleNextBokck = () => {
    let maxPage = 5 + (this.state.activeBlock - 1) * 5;
    this.setState({activeBlock: this.state.activeBlock + 1, activePage: maxPage + 1}, this.fetchData)
  };

  renderPrevPage() {
    if (this.state.activeBlock > 1) {
      return (
          <PaginationItem style={{display: 'inline-block'}}>
            <PaginationLink onClick={this.handlePrevBokck} previous tag="button"></PaginationLink>
          </PaginationItem>
      )
    }
  }

  renderNextPage() {
    if (this.state.activeBlock < this.state.totalBlock) {
      return (
          <PaginationItem style={{display: 'inline-block'}}>
            <PaginationLink onClick={this.handleNextBokck} next tag="button"></PaginationLink>
          </PaginationItem>
      )
    }
  }

  renderActivePage() {
    if (this.state.totalPage === 0) {
      return;
    }

    let pageCount = 0;
    if (this.state.activeBlock < this.state.totalBlock || this.state.totalPage % this.PAGE_PER_BLOCK === 0) {
      pageCount = this.PAGE_PER_BLOCK
    } else {
      pageCount = this.state.totalPage % this.PAGE_PER_BLOCK
    }

    const pageArray = [];
    for (let i = 0; i < pageCount; i++) {
      const pageNum = i + 1 + (this.state.activeBlock - 1) * this.PAGE_PER_BLOCK;
      pageArray.push(
          <PaginationItem style={{display: 'inline-block'}} active={this.state.activePage === pageNum}>
            <PaginationLink onClick={() => {
              this.handlePageChange(pageNum)
            }} tag="button">{pageNum}</PaginationLink>
          </PaginationItem>
      )
    }

    return (
        pageArray
    )
  }

  handlePageChange = (page) => {
    this.setState({activePage: page}, this.fetchData)
  };

  handleFromDateChange = (date) => {
    this.setState({fromDate: date})
  };

  handleToDateChange = (date) => {
    this.setState({toDate: date})
  };

  renderPage() {
    return (
        <Pagination style={{margin: '0 auto 0 auto', display: 'table'}}>
          {this.renderPrevPage()}
          {this.renderActivePage()}
          {this.renderNextPage()}
        </Pagination>
    )
  }

  render() {
    const {fromDate, toDate, page, content} = this.state;
    return (
        <div className="animated fadeIn">
          <Row>
            <Col xs="12" lg="12">
              <Card style={{marginBottom: 15 + 'px'}}>
                <CardHeader>
                  <Form inline>
                    <FormGroup className="pr-1">
                      <Label htmlFor="exampleInputName2" className="pr-1">Period</Label>
                      <DatePicker className="form-control" selected={fromDate} onChange={this.handleFromDateChange} dateFormat="YYYY-MM-DD"/>
                      ~
                      <DatePicker className="form-control" selected={toDate} onChange={this.handleToDateChange} dateFormat="YYYY-MM-DD"/>
                    </FormGroup>
                    <FormGroup className="pr-1">
                      <Label htmlFor="exampleInputEmail2" className="pr-1">Keyword</Label>
                      <Input type="text" id="exampleInputEmail2" placeholder="keyword" onChange={this.handleKeywordChange}/>
                    </FormGroup>
                    <Button size="sm" color="primary" onClick={this.handleSearchClick}><i className="fa fa-dot-circle-o"></i>Search</Button>
                  </Form>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <strong>Page Views</strong>
                </CardHeader>
                <CardBody>
                  <Table striped style={{tableLayout: 'fixed'}}>
                    <colgroup>
                      <col width="5%"/>
                      <col/>
                      <col width="20%"/>
                      <col width="7%"/>
                      <col width="7%"/>
                      <col width="20%"/>
                      <col width="7%"/>
                    </colgroup>
                    <thead>
                    <tr>
                      <th>No</th>
                      <th>Page Name</th>
                      <th>Description</th>
                      <th>Count</th>
                      <th>Rate(%)</th>
                      <th></th>
                      <th></th>
                    </tr>
                    </thead>
                    <tbody>
                    {this.renderContent()}
                    </tbody>
                  </Table>
                  {this.renderPage()}
                </CardBody>
              </Card>
            </Col>
          </Row>
          <Modal isOpen={this.state.modal} toggle={this.popupModel} className={'modal-lg ' + this.props.className}>
            <ModalHeader toggle={this.popupModel}>Content({page})</ModalHeader>
            <ModalBody>
              <FormGroup row>
                <Col xs="12" md="12">
                  <Input type="textarea" name="textarea-input" id="textarea-input" rows="20" value={content} placeholder="Content..."/>
                </Col>
              </FormGroup>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" onClick={this.popupModel}>OK</Button>
            </ModalFooter>
          </Modal>
        </div>
    );
  }
}