import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getCurrentProfile, deleteAccount } from '../../actions/profileActions';
import ProfileActions from './ProfileActions';
import Spinner from '../common/Spinner';
import Experience from './Experience';
import Education from './Education';
import PaypalExpressBtn from 'react-paypal-express-checkout';

class Dashboard extends Component {
	componentDidMount() {
		this.props.getCurrentProfile();
	}

	onDeleteClick(e) {
		this.props.deleteAccount();
	}

	render() {
		// PayPal Account
		const client = {
            sandbox:    'AZg_yx4mmh5r8fKY_GtEas-zli4jOYXRESQuSXaIdeIEyWZEzsGlsWw_8G3KfkempHtBZniOIMHA9BQY',
            production: 'EGvEY6HxEmeN5ssRRRyLu4UxHEduZQwQwIAtKMJLm6a1WpDyrf0Sv-3FRMz2oGa3UO3defIzz3qpLNf-',
        }

		const { user } = this.props.auth;
	    const { profile, loading } = this.props.profile;

	    let dashboardContent;

	    if (profile === null || loading) {
	    	dashboardContent = <Spinner />;
	    } else {
			if(Object.keys(profile).length > 0) {
				dashboardContent = (
					<div>
						<p className="lead text-muted">Welcome <Link to={`/profile/${profile.handle}`}>{user.name}</Link>!</p>
						<ProfileActions />
						<Experience experience={profile.experience} />
            			<Education education={profile.education} />

						<div style={{ marginBottom: '60px' }} />

						<button onClick={this.onDeleteClick.bind(this)} className="btn btn-danger">Delete Account</button>

						<div className="donations col-md-12 text-center mt-4">
			              <h3 className="text-black mb-2">Please donate for the maintenance of our site. Thank you!</h3>
			              	<PaypalExpressBtn client={client} currency={'USD'} total={100.00} />
			            </div>

					</div>
				);
			} else {

	        dashboardContent = (
          <div>
            <p className="lead text-muted">Welcome {user.name}</p>
            <p>First time user or just don't have profile?</p>
            <p>Create one now.</p>
            <Link to="/create-profile" className="btn btn-lg btn-primary">
              Create a Profile
            </Link>
          </div>
        );
      }
    }

	    return (
	      <div className="dashboard">
	        <div className="container">
	          <div className="row">
	            <div className="col-md-12">
	              <h1 className="display-4">User Credentials</h1>
	              {dashboardContent}
	            </div>
	          </div>
	        </div>
	      </div>
	    );
	}
}

Dashboard.propTypes = {
  getCurrentProfile: PropTypes.func.isRequired,
  deleteAccount: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  profile: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  profile: state.profile,
  auth: state.auth
});

export default connect(mapStateToProps, { getCurrentProfile, deleteAccount })(Dashboard);