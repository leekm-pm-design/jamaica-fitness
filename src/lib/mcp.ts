// src/lib/mcp.ts

export interface MCPResponse<T = any> {
  result?: {
    content: Array<{
      type: string;
      text: string;
    }>;
  };
  error?: {
    code: number;
    message: string;
  };
}

export class MCPClient {
  private baseUrl = 'https://mcp.supabase.com/mcp';
  private projectRef = 'znxmrewxmefydmhgxwrx';
  private token = 'sbp_16e1c2f8c8bb77c9ba98f1373d9a37e6b8a25fc9';
  private sessionId = `session_${Date.now()}`;

  private async makeRequest(method: string, params: any): Promise<MCPResponse> {
    const response = await fetch(`${this.baseUrl}?project_ref=${this.projectRef}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
        'Authorization': `Bearer ${this.token}`,
        'Mcp-Session-Id': this.sessionId,
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method,
        params,
        id: Date.now(),
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async executeSQL(query: string): Promise<any> {
    const response = await this.makeRequest('tools/call', {
      name: 'execute_sql',
      arguments: { query },
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    if (response.result?.content?.[0]?.text) {
      try {
        const responseText = response.result.content[0].text;

        // Look for JSON array in the response - it should start with [ and end with ]
        const jsonArrayMatch = responseText.match(/(\[[\s\S]*?\])/);
        if (jsonArrayMatch && jsonArrayMatch[1]) {
          try {
            let jsonContent = jsonArrayMatch[1].trim();

            // If the JSON is escaped, unescape it
            if (jsonContent.includes('\\"')) {
              jsonContent = jsonContent.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
            }

            const parsedData = JSON.parse(jsonContent);
            return parsedData;
          } catch (e) {
            console.error('MCP JSON parsing error:', e);
          }
        }

        // If no boundaries found, try to parse the full response
        const result = JSON.parse(responseText);
        console.log('DEBUG: Parsed full response:', result);

        // Check if result has nested data structure
        if (result.result && typeof result.result === 'string') {
          try {
            const nestedData = JSON.parse(result.result);
            console.log('DEBUG: Successfully parsed nested result:', nestedData);
            return nestedData;
          } catch (e) {
            // If parsing fails, return the result string as is
            console.log('DEBUG: Nested parsing failed, returning result string:', result.result);
            return result.result;
          }
        }

        return result;
      } catch (e) {
        console.error('Error parsing MCP response:', e);
        console.error('Raw response text length:', response.result.content[0].text?.length);
        console.error('First 500 chars of response:', response.result.content[0].text?.substring(0, 500));
        return [];  // Return empty array instead of null to prevent 'find' errors
      }
    }

    return [];  // Return empty array instead of null
  }

  async listTables(): Promise<any> {
    const response = await this.makeRequest('tools/call', {
      name: 'list_tables',
      arguments: {},
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    if (response.result?.content?.[0]?.text) {
      return JSON.parse(response.result.content[0].text);
    }

    return null;
  }

  // CRUD Operations
  async getCustomers(limit = 10): Promise<any[]> {
    const query = `SELECT * FROM customers ORDER BY created_at DESC LIMIT ${limit};`;
    return await this.executeSQL(query);
  }

  async getCustomerById(id: number): Promise<any> {
    const query = `SELECT * FROM customers WHERE id = ${id};`;
    const result = await this.executeSQL(query);
    return result?.[0] || null;
  }

  async createCustomer(name: string, phone: string, membershipType: string): Promise<any> {
    const query = `
      INSERT INTO customers (name, phone, membership_type)
      VALUES ('${name}', '${phone}', '${membershipType}')
      RETURNING *;
    `;
    const result = await this.executeSQL(query);
    return result?.[0] || null;
  }

  async updateCustomer(id: number, name: string, phone: string, membershipType: string): Promise<any> {
    const query = `
      UPDATE customers
      SET name = '${name}', phone = '${phone}', membership_type = '${membershipType}'
      WHERE id = ${id}
      RETURNING *;
    `;
    const result = await this.executeSQL(query);
    return result?.[0] || null;
  }

  async getContracts(limit = 10): Promise<any[]> {
    const query = `
      SELECT c.*, cu.name, cu.phone, cu.membership_type
      FROM contracts c
      JOIN customers cu ON c.customer_id = cu.id
      ORDER BY c.contract_date DESC
      LIMIT ${limit};
    `;
    return await this.executeSQL(query);
  }

  async createContract(customerId: number, signatureData: string, agreedTerms = true, pdfUrl?: string): Promise<any> {
    const query = pdfUrl
      ? `
        INSERT INTO contracts (customer_id, signature_data, pdf_url, agreed_terms)
        VALUES (${customerId}, '${signatureData}', '${pdfUrl}', ${agreedTerms})
        RETURNING *;
      `
      : `
        INSERT INTO contracts (customer_id, signature_data, agreed_terms)
        VALUES (${customerId}, '${signatureData}', ${agreedTerms})
        RETURNING *;
      `;
    const result = await this.executeSQL(query);
    return result?.[0] || null;
  }

  async getContractById(id: number): Promise<any> {
    const query = `
      SELECT c.*, cu.name, cu.phone, cu.membership_type
      FROM contracts c
      JOIN customers cu ON c.customer_id = cu.id
      WHERE c.id = ${id};
    `;
    const result = await this.executeSQL(query);
    return result?.[0] || null;
  }

  async searchCustomers(searchTerm: string): Promise<any[]> {
    const query = `
      SELECT * FROM customers
      WHERE name ILIKE '%${searchTerm}%' OR phone LIKE '%${searchTerm}%'
      ORDER BY created_at DESC;
    `;
    return await this.executeSQL(query);
  }
}