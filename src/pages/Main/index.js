import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { FaGithubAlt, FaPlus, FaSpinner } from 'react-icons/fa';

import api from '../../services/api';

import Container from '../../components/Container';
import { Form, InputText, SubmitButton, List } from './styles';

class Main extends Component {
  state = {
    newRepo: '',
    repositories: [],
    loading: false,
    error: false,
    errorMessage: '',
  };

  componentDidMount() {
    const repositories = localStorage.getItem('repositories');

    if (repositories) {
      this.setState({ repositories: JSON.parse(repositories) });
    }
  }

  componentDidUpdate(_, prevState) {
    const { repositories } = this.state;

    if (prevState.repositories !== repositories) {
      localStorage.setItem('repositories', JSON.stringify(repositories));
    }
  }

  handleInputChange = (e) => {
    this.setState({ newRepo: e.target.value });
  };

  handleSubmit = async (e) => {
    e.preventDefault();

    this.setState({ loading: true });

    const { newRepo, repositories } = this.state;

    try {
      const response = await api.get(`/repos/${newRepo}`);

      const repositoryExists = repositories.find(
        (repo) => repo.name === response.data.full_name
      );

      if (repositoryExists) {
        this.setState({
          error: true,
          errorMessage: 'Repositório duplicado!',
          loading: false,
        });
      } else {
        const data = {
          name: response.data.full_name,
        };

        this.setState({
          repositories: [...repositories, data],
          newRepo: '',
          loading: false,
        });
      }
    } catch (err) {
      this.setState({
        error: true,
        loading: false,
        errorMessage: 'Esse repositório não existe!',
      });
    }
  };

  render() {
    const { newRepo, repositories, loading, error, errorMessage } = this.state;

    return (
      <Container>
        <h1>
          <FaGithubAlt />
          Repositórios
        </h1>

        <Form onSubmit={this.handleSubmit} error={error}>
          <div>
            <InputText
              placeholder="Adicionar repositório"
              value={newRepo}
              onChange={this.handleInputChange}
              error={error}
            />

            <SubmitButton loading={loading}>
              {loading ? (
                <FaSpinner color="#FFF" size={14} />
              ) : (
                <FaPlus color="#FFF" size={14} />
              )}
            </SubmitButton>
          </div>
          <small>{errorMessage}</small>
        </Form>

        <List>
          {repositories.map((repository) => (
            <li key={repository.name}>
              <span>{repository.name}</span>
              <Link to={`/repository/${encodeURIComponent(repository.name)}`}>
                Detalhes
              </Link>
            </li>
          ))}
        </List>
      </Container>
    );
  }
}

export default Main;
