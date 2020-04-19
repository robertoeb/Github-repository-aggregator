import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {
  FaRegArrowAltCircleLeft,
  FaRegArrowAltCircleRight,
} from 'react-icons/fa';

import api from '../../services/api';

import Container from '../../components/Container';
import { Loading, Owner, IssueList, ButtonWrapper } from './styles';

class Repository extends Component {
  state = {
    repository: {},
    issues: [],
    loading: true,
    page: 1,
    status: 'all',
  };

  async componentDidMount() {
    const { match } = this.props;
    const { status } = this.state;

    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: status,
          per_page: 5,
        },
      }),
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
    });
  }

  fetchIssues = async (page, status) => {
    const { match } = this.props;

    const repoName = decodeURIComponent(match.params.repository);

    const response = await api.get(`/repos/${repoName}/issues`, {
      params: {
        state: status,
        per_page: 5,
        page,
      },
    });

    this.setState({
      issues: response.data,
      page,
    });
  };

  render() {
    const { repository, issues, loading, page, status } = this.state;

    if (loading) {
      return <Loading>Carregando</Loading>;
    }

    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>

        {issues.length > 0 && (
          <>
            <IssueList>
              {issues.map((issue) => (
                <li key={String(issue.id)}>
                  <img src={issue.user.avatar_url} alt={issue.user.login} />
                  <div>
                    <strong>
                      <a href={issue.html_url}>{issue.title}</a>
                      {issue.labels.map((label) => (
                        <span key={String(label.id)}>{label.name}</span>
                      ))}
                    </strong>
                    <p>{issue.user.login}</p>
                  </div>
                </li>
              ))}
            </IssueList>
            <ButtonWrapper>
              <FaRegArrowAltCircleLeft
                size="30px"
                color="#7159C1"
                disabled={page === 1}
                onClick={() => this.fetchIssues(page - 1, status)}
              />
              <select
                name="status"
                onChange={(e) => this.fetchIssues(page, e.target.value)}
              >
                <option value="all">Todas issues</option>
                <option value="open">Issues abertas</option>
                <option value="closed">Issues fechadas</option>
              </select>
              <FaRegArrowAltCircleRight
                size="30px"
                color="#7159C1"
                onClick={() => this.fetchIssues(page + 1, status)}
              />
            </ButtonWrapper>
          </>
        )}
      </Container>
    );
  }
}

Repository.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      repository: PropTypes.string,
    }),
  }).isRequired,
};

export default Repository;
