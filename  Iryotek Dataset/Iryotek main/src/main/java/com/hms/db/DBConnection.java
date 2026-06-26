package com.hms.db;

import java.sql.Connection;
import java.sql.DriverManager;

public class DBConnection {

	private static Connection conn;
	
	public static Connection getConn() {
		
		try {
			
			//step:1 for connection - load the driver class 
			Class.forName("com.mysql.cj.jdbc.Driver");
			
			// Fetch database configuration from environment variables
			String dbUrl = System.getenv("DB_URL");
			String dbUser = System.getenv("DB_USER");
			String dbPassword = System.getenv("DB_PASSWORD");

			// Fallbacks for local execution
			if (dbUrl == null || dbUrl.trim().isEmpty()) {
				dbUrl = "jdbc:mysql://localhost:3306/hospital";
			}
			if (dbUser == null || dbUser.trim().isEmpty()) {
				dbUser = "root";
			}
			if (dbPassword == null || dbPassword.trim().isEmpty()) {
				dbPassword = "Your_mysql_password";
			}

			//step:2- create a connection
			conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword);
			
		} catch (Exception e) {
			e.printStackTrace();
		}
		
		return conn;
	}
}
