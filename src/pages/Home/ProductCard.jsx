import React, { useState, useEffect } from 'react';
import './ProductCard.css';
import { FaPlus, FaTrash, FaEdit, FaBoxOpen, FaExclamationTriangle } from 'react-icons/fa';
import { getAllProducts, editProduct, addProduct, deleteProduct } from '../../services/api';

export default function ProductCard({ visible, onClose }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showNewProductForm, setShowNewProductForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  
  // Estados para validação e feedback visual
  const [fieldErrors, setFieldErrors] = useState({});
  const [formTouched, setFormTouched] = useState(false);
  
  // Estado para o formulário de edição
  const [formData, setFormData] = useState({
    nome_produto: '',
    descricao: '',
    valor: '',
    estoque: ''
  });

  // Estado para o formulário de novo produto
  const [newProductData, setNewProductData] = useState({
    nome_produto: '',
    descricao: '',
    valor: '',
    estoque: ''
  });
  
  // Estados para validação do formulário de novo produto
  const [newProductErrors, setNewProductErrors] = useState({});
  const [newProductFormTouched, setNewProductFormTouched] = useState(false);

  // Buscar produtos da API quando o componente for montado
  useEffect(() => {
    if (visible) {
      fetchProducts();
    }
  }, [visible]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setSuccess(null);
      const productsData = await getAllProducts();
      
      if (Array.isArray(productsData)) {
        setProducts(productsData);
        console.log(`${productsData.length} produtos carregados com sucesso.`);
        setError(null);
        setSuccess(`${productsData.length} produto(s) carregado(s) com sucesso!`);
        // O sucesso é mostrado por 3 segundos e depois desaparece
        setTimeout(() => setSuccess(null), 3000);
      } else {
        console.warn("A resposta da API não é um array:", productsData);
        setProducts([]);
        setError("Formato de resposta inesperado. Por favor, tente novamente.");
      }
    } catch (err) {
      console.error("Erro ao buscar produtos:", err);
      setError(err.message || "Não foi possível carregar os produtos");
    } finally {
      setLoading(false);
    }
  };

  // Formatar valor para exibição
  const formatCurrency = (value) => {
    if (value === null || value === undefined) return 'R$ 0,00';
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Validação de campos para edição
  const validateForm = () => {
    const errors = {};
    
    if (!formData.nome_produto.trim()) {
      errors.nome_produto = 'O nome do produto é obrigatório';
    }
    
    if (formData.valor && isNaN(parseFloat(formData.valor.replace(',', '.').replace(/[^\d.,]/g, '')))) {
      errors.valor = 'Valor inválido';
    }
    
    if (formData.estoque && isNaN(parseInt(formData.estoque))) {
      errors.estoque = 'Quantidade de estoque inválida';
    }
    
    return errors;
  };

  // Validação de campos para novo produto
  const validateNewProductForm = () => {
    const errors = {};
    
    if (!newProductData.nome_produto.trim()) {
      errors.nome_produto = 'O nome do produto é obrigatório';
    }
    
    if (newProductData.valor && isNaN(parseFloat(newProductData.valor.replace(',', '.').replace(/[^\d.,]/g, '')))) {
      errors.valor = 'Valor inválido';
    }
    
    if (newProductData.estoque && isNaN(parseInt(newProductData.estoque))) {
      errors.estoque = 'Quantidade de estoque inválida';
    }
    
    return errors;
  };

  // Atualiza o estado do formulário de edição quando os campos são alterados
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    
    // Formata valores monetários
    if (name === 'valor') {
      // Remove caracteres não numéricos, exceto vírgula e ponto
      const numericValue = value.replace(/[^\d.,]/g, '');
      
      if (numericValue) {
        // Converte para número e formata como moeda brasileira
        const numberValue = numericValue.replace(',', '.');
        if (!isNaN(parseFloat(numberValue))) {
          const formatted = new Intl.NumberFormat('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(parseFloat(numberValue));
          newValue = formatted;
        } else {
          newValue = numericValue;
        }
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    // Marca o formulário como tocado para ativar validações visuais
    if (!formTouched) {
      setFormTouched(true);
    }
    
    // Valida o campo atual quando o usuário digita
    if (formTouched) {
      const fieldValidation = {};
      
      // Validação específica para cada campo
      if (name === 'nome_produto' && !newValue.trim()) {
        fieldValidation.nome_produto = 'O nome do produto é obrigatório';
      }
      
      if (name === 'valor' && newValue) {
        const numericValue = newValue.replace(',', '.').replace(/[^\d.,]/g, '');
        if (isNaN(parseFloat(numericValue))) {
          fieldValidation.valor = 'Valor inválido';
        }
      }
      
      if (name === 'estoque' && newValue) {
        if (isNaN(parseInt(newValue))) {
          fieldValidation.estoque = 'Quantidade de estoque inválida';
        }
      }
      
      // Atualiza apenas o erro do campo atual, mantendo os outros erros
      setFieldErrors(prev => ({
        ...prev,
        [name]: fieldValidation[name] || null
      }));
    }
  };

  // Atualiza o estado do formulário de novo produto quando os campos são alterados
  const handleNewProductInputChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    
    // Formata valores monetários
    if (name === 'valor') {
      // Remove caracteres não numéricos, exceto vírgula e ponto
      const numericValue = value.replace(/[^\d.,]/g, '');
      
      if (numericValue) {
        // Converte para número e formata como moeda brasileira
        const numberValue = numericValue.replace(',', '.');
        if (!isNaN(parseFloat(numberValue))) {
          const formatted = new Intl.NumberFormat('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(parseFloat(numberValue));
          newValue = formatted;
        } else {
          newValue = numericValue;
        }
      }
    }
    
    setNewProductData(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    // Marca o formulário como tocado para ativar validações visuais
    if (!newProductFormTouched) {
      setNewProductFormTouched(true);
    }
    
    // Valida o campo atual quando o usuário digita
    if (newProductFormTouched) {
      const fieldValidation = {};
      
      // Validação específica para cada campo
      if (name === 'nome_produto' && !newValue.trim()) {
        fieldValidation.nome_produto = 'O nome do produto é obrigatório';
      }
      
      if (name === 'valor' && newValue) {
        const numericValue = newValue.replace(',', '.').replace(/[^\d.,]/g, '');
        if (isNaN(parseFloat(numericValue))) {
          fieldValidation.valor = 'Valor inválido';
        }
      }
      
      if (name === 'estoque' && newValue) {
        if (isNaN(parseInt(newValue))) {
          fieldValidation.estoque = 'Quantidade de estoque inválida';
        }
      }
      
      // Atualiza apenas o erro do campo atual, mantendo os outros erros
      setNewProductErrors(prev => ({
        ...prev,
        [name]: fieldValidation[name] || null
      }));
    }
  };

  // Manipula a edição de um produto
  const handleEditProduct = (product) => {
    // Reseta estados de validação
    setFieldErrors({});
    setFormTouched(false);
    
    // Define dados do produto atual
    setCurrentProduct(product);
    setFormData({
      nome_produto: product.nome_produto || '',
      descricao: product.descricao || '',
      valor: product.valor ? formatCurrency(product.valor).replace('R$ ', '') : '',
      estoque: product.estoque?.toString() || ''
    });
    
    // Exibe o formulário
    setShowEditForm(true);
  };

  // Função para adicionar novo produto
  const handleAddProduct = async () => {
    try {
      // Valida o formulário antes de enviar
      const errors = validateNewProductForm();
      const hasErrors = Object.keys(errors).length > 0;
      
      if (hasErrors) {
        setNewProductErrors(errors);
        return;
      }
      
      // Indica que está salvando
      setLoading(true);
      setError(null);
      
      // Prepara os dados para envio à API
      const apiData = {
        nome_produto: newProductData.nome_produto.trim(),
        descricao: newProductData.descricao.trim(),
        valor: parseFloat(newProductData.valor.replace(/[^\d.,]/g, '').replace(',', '.')),
        estoque: parseInt(newProductData.estoque || '0')
      };
      
      // Envia a requisição para a API
      await addProduct(apiData);
      
      // Limpa o formulário
      setNewProductData({
        nome_produto: '',
        descricao: '',
        valor: '',
        estoque: ''
      });
      
      // Fecha o formulário de adição
      setShowNewProductForm(false);
      
      // Atualiza a lista de produtos
      await fetchProducts();
      
      // Exibe mensagem de sucesso
      setSuccess('Produto adicionado com sucesso!');
      
      // O sucesso é mostrado por 3 segundos e depois desaparece
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Erro ao adicionar produto:", err);
      setError(err.message || "Não foi possível adicionar o produto");
    } finally {
      setLoading(false);
      
      // Reseta os estados de validação para o próximo uso
      setTimeout(() => {
        setNewProductErrors({});
        setNewProductFormTouched(false);
      }, 300);
    }
  };

  // Manipula a exclusão de um produto
  const handleDeleteProduct = (product) => {
    setCurrentProduct(product);
    setShowDeleteConfirm(true);
  };

  // Confirma a exclusão do produto
  const confirmDeleteProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Verifica se há um produto selecionado para exclusão
      if (!currentProduct || !currentProduct.id) {
        throw new Error('Produto não identificado para exclusão.');
      }
      
      // Envia a requisição para a API
      await deleteProduct(currentProduct.id);
      
      // Atualiza a lista de produtos
      await fetchProducts();
      
      // Fecha o diálogo de confirmação
      setShowDeleteConfirm(false);
      setCurrentProduct(null);
      setSuccess('Produto excluído com sucesso!');
      
      // O sucesso é mostrado por 3 segundos e depois desaparece
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Erro ao excluir produto:", err);
      setError(err.message || "Não foi possível excluir o produto");
    } finally {
      setLoading(false);
    }
  };

  // Salva as alterações do produto
  const handleSaveEdit = async () => {
    try {
      // Valida o formulário antes de enviar
      const errors = validateForm();
      const hasErrors = Object.keys(errors).length > 0;
      
      if (hasErrors) {
        setFieldErrors(errors);
        return;
      }
      
      // Indica que está salvando
      setLoading(true);
      setError(null);
      
      // Verifica se há um produto selecionado para edição
      if (!currentProduct || !currentProduct.id) {
        throw new Error('Produto não identificado para edição.');
      }

      // Prepara os dados para envio à API
      const apiData = {
        nome_produto: formData.nome_produto.trim(),
        descricao: formData.descricao.trim(),
        valor: parseFloat(formData.valor.replace(/[^\d.,]/g, '').replace(',', '.')),
        estoque: parseInt(formData.estoque || '0')
      };

      // Envia a requisição para a API
      await editProduct(currentProduct.id, apiData);
      
      // Atualiza a lista de produtos após edição bem-sucedida
      await fetchProducts();
      
      // Fecha o formulário de edição
      setShowEditForm(false);
      setCurrentProduct(null);
      setSuccess('Produto atualizado com sucesso!');
      
      // O sucesso é mostrado por 3 segundos e depois desaparece
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Erro ao editar produto:", err);
      setError(err.message || "Não foi possível editar o produto");
    } finally {
      setLoading(false);
      
      // Reseta os estados de validação para o próximo uso
      setTimeout(() => {
        setFieldErrors({});
        setFormTouched(false);
      }, 300);
    }
  };

  // Renderizar mensagens de erro ou sucesso
  const renderMessages = () => {
    return (
      <>
        {error && (
          <div className="error-message">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '10px'}}>
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            {error}
          </div>
        )}
        {success && (
          <div className="success-message">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '10px'}}>
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            {success}
          </div>
        )}
      </>
    );
  };

  // Renderizar tabela de produtos
  const renderProductsTable = () => {
    if (loading) {
      return (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Carregando produtos...</p>
        </div>
      );
    }

    if (products.length === 0) {
      return (
        <div className="empty-list-container">
          <p>Nenhum produto cadastrado.</p>
          <button 
            className="reload-button" 
            onClick={fetchProducts}
          >
            Recarregar dados
          </button>
        </div>
      );
    }

    return (
      <table className="products-table">
        <thead>
          <tr>
            <th className="product-name-col product-header-highlight">Nome do Produto</th>
            <th className="product-desc-col">Descrição</th>
            <th className="product-price-col">Valor</th>
            <th className="product-stock-col">Estoque</th>
            <th className="product-actions-col">Ações</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, index) => (
            <tr key={product.id || `product-${index}`}>
              <td className="product-name product-cell-text">{product.nome_produto || 'Nome não informado'}</td>
              <td className="product-truncate product-cell-text">{product.descricao || 'Sem descrição'}</td>
              <td className="product-price product-cell-text">{formatCurrency(product.valor)}</td>
              <td className="product-stock product-cell-text">{product.estoque || '0'}</td>
              <td>
                <div className="product-actions">
                  <button 
                    className="product-action-button product-edit-button" 
                    title="Editar produto"
                    onClick={() => handleEditProduct(product)}
                  >
                    <FaEdit />
                  </button>
                  <button 
                    className="product-action-button product-delete-button" 
                    title="Excluir produto"
                    onClick={() => handleDeleteProduct(product)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  if (!visible) return null;

  return (
    <div className="product-card-overlay">
      <div className="product-card high-contrast-text">
        <div className="product-card-header">
          <h2>
            <FaBoxOpen /> Gerenciamento de Produtos
          </h2>
          <button onClick={onClose}>×</button>
        </div>
        
        <div className="product-card-content">
          {renderMessages()}
          
          {showNewProductForm ? (
            <div className="product-edit-form">
              <h3 className="edit-form-title">Novo Produto</h3>
              <div className="edit-form-row">
                <div className="edit-form-group">
                  <label htmlFor="nome_produto">Nome do Produto</label>
                  <input 
                    type="text" 
                    id="nome_produto" 
                    name="nome_produto"
                    placeholder="Nome do produto" 
                    value={newProductData.nome_produto}
                    onChange={handleNewProductInputChange}
                    className={`edit-form-input ${newProductErrors.nome_produto ? 'input-error' : ''}`}
                    autoFocus
                  />
                  {newProductErrors.nome_produto && (
                    <div className="input-error-message">{newProductErrors.nome_produto}</div>
                  )}
                </div>
                <div className="edit-form-group">
                  <label htmlFor="valor">Valor (R$)</label>
                  <input 
                    type="text" 
                    id="valor" 
                    name="valor"
                    placeholder="0,00" 
                    value={newProductData.valor}
                    onChange={handleNewProductInputChange}
                    className={`edit-form-input ${newProductErrors.valor ? 'input-error' : ''}`}
                  />
                  {newProductErrors.valor && (
                    <div className="input-error-message">{newProductErrors.valor}</div>
                  )}
                </div>
              </div>

              <div className="edit-form-row">
                <div className="edit-form-group">
                  <label htmlFor="descricao">Descrição</label>
                  <textarea 
                    id="descricao" 
                    name="descricao"
                    placeholder="Descrição do produto" 
                    value={newProductData.descricao}
                    onChange={handleNewProductInputChange}
                    className="edit-form-textarea"
                  ></textarea>
                </div>
                <div className="edit-form-group">
                  <label htmlFor="estoque">Estoque</label>
                  <input 
                    type="number" 
                    id="estoque" 
                    name="estoque"
                    placeholder="0"
                    min="0" 
                    value={newProductData.estoque}
                    onChange={handleNewProductInputChange}
                    className={`edit-form-input ${newProductErrors.estoque ? 'input-error' : ''}`}
                  />
                  {newProductErrors.estoque && (
                    <div className="input-error-message">{newProductErrors.estoque}</div>
                  )}
                </div>
              </div>

              <div className="edit-form-buttons">
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => {
                    setShowNewProductForm(false);
                    setNewProductErrors({});
                    setNewProductData({
                      nome_produto: '',
                      descricao: '',
                      valor: '',
                      estoque: ''
                    });
                  }}
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button 
                  type="button" 
                  className={`save-button ${loading ? 'button-loading' : ''}`}
                  onClick={handleAddProduct}
                  disabled={loading}
                >
                  <span className="button-text">{loading ? 'Salvando...' : 'Salvar'}</span>
                  {loading ? (
                    <span className="spinner-small"></span>
                  ) : (
                    <span className="button-arrow">➔</span>
                  )}
                </button>
              </div>
            </div>
          ) : showDeleteConfirm ? (
            <div className="product-delete-confirmation">
              <div className="delete-confirm-content">
                <div className="delete-icon">
                  <FaExclamationTriangle />
                </div>
                <h3>Confirmar Exclusão</h3>
                <p>Tem certeza que deseja excluir o produto <strong>{currentProduct?.nome_produto || 'selecionado'}</strong>?</p>
                <p className="delete-warning">Esta ação não poderá ser desfeita!</p>
                
                <div className="delete-confirm-buttons">
                  <button 
                    className="cancel-button"
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setCurrentProduct(null);
                    }}
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                  <button 
                    className={`delete-confirm-button ${loading ? 'button-loading' : ''}`}
                    onClick={confirmDeleteProduct}
                    disabled={loading}
                  >
                    <span className="button-text">{loading ? 'Excluindo...' : 'Excluir'}</span>
                    {loading ? (
                      <span className="spinner-small"></span>
                    ) : (
                      <FaTrash style={{ marginLeft: '8px' }} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : showEditForm ? (
            <div className="product-edit-form">
              <h3 className="edit-form-title">Editar Produto</h3>
              
              <div className="edit-form-row">
                <div className="edit-form-group">
                  <label htmlFor="edit_nome_produto">Nome do Produto</label>
                  <input 
                    type="text" 
                    id="edit_nome_produto" 
                    name="nome_produto"
                    value={formData.nome_produto}
                    onChange={handleInputChange}
                    className={`edit-form-input ${fieldErrors.nome_produto ? 'input-error' : ''}`}
                    autoFocus
                  />
                  {fieldErrors.nome_produto && (
                    <div className="input-error-message">{fieldErrors.nome_produto}</div>
                  )}
                </div>
                <div className="edit-form-group">
                  <label htmlFor="edit_valor">Valor (R$)</label>
                  <input 
                    type="text" 
                    id="edit_valor" 
                    name="valor"
                    value={formData.valor}
                    onChange={handleInputChange}
                    className={`edit-form-input ${fieldErrors.valor ? 'input-error' : ''}`}
                  />
                  {fieldErrors.valor && (
                    <div className="input-error-message">{fieldErrors.valor}</div>
                  )}
                </div>
              </div>

              <div className="edit-form-row">
                <div className="edit-form-group">
                  <label htmlFor="edit_descricao">Descrição</label>
                  <textarea 
                    id="edit_descricao" 
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleInputChange}
                    className="edit-form-textarea"
                  ></textarea>
                </div>
                <div className="edit-form-group">
                  <label htmlFor="edit_estoque">Estoque</label>
                  <input 
                    type="number" 
                    id="edit_estoque" 
                    name="estoque"
                    min="0"
                    value={formData.estoque}
                    onChange={handleInputChange}
                    className={`edit-form-input ${fieldErrors.estoque ? 'input-error' : ''}`}
                  />
                  {fieldErrors.estoque && (
                    <div className="input-error-message">{fieldErrors.estoque}</div>
                  )}
                </div>
              </div>

              <div className="edit-form-buttons">
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => setShowEditForm(false)}
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button 
                  type="button" 
                  className={`save-button ${loading ? 'button-loading' : ''}`}
                  onClick={handleSaveEdit}
                  disabled={loading}
                >
                  <span className="button-text">{loading ? 'Salvando...' : 'Salvar'}</span>
                  {loading ? (
                    <span className="spinner-small"></span>
                  ) : (
                    <span className="button-arrow">➔</span>
                  )}
                </button>
              </div>
            </div>
          ) : (
            renderProductsTable()
          )}
        </div>

        <div className="product-card-actions">
          <div className="product-card-actions-left">
            <button 
              className="product-refresh-button"
              onClick={fetchProducts}
              disabled={loading}
            >
              Atualizar lista
            </button>
          </div>
          <div className="product-card-actions-right">
            <button 
              className="product-add-button"
              onClick={() => setShowNewProductForm(true)}
            >
              <FaPlus /> Novo Produto
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
