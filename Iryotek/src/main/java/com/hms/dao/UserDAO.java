package com.hms.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

import com.hms.entity.User;
import org.mindrot.jbcrypt.BCrypt;

public class UserDAO {

	private Connection conn;

	public UserDAO(Connection conn) {
		super();
		this.conn = conn;
	}

	public boolean userRegister(User user) {

		boolean f = false;

		try {
			// insert user in db
			String sql = "insert into user_details(full_name, email, password) values(?,?,?)";

			String hashed = BCrypt.hashpw(user.getPassword(), BCrypt.gensalt());

			PreparedStatement pstmt = conn.prepareStatement(sql);
			pstmt.setString(1, user.getFullName());
			pstmt.setString(2, user.getEmail());
			pstmt.setString(3, hashed);

			pstmt.executeUpdate();

			f = true; // if query execute successfully then f becomes true otherwise false...

		} catch (Exception e) {
			e.printStackTrace();

		}

		return f;
	}

	// when call loginUser() method, it checks that particular user available or
	// not?
	// if not available then return null user object.
	// and if particular user available then, create User object(i.e user) and fetch
	// all the data of that user from db
	// and return that specific users object.
	public User loginUser(String email, String password) {

		User user = null;

		try {
			String sql = "select * from user_details where email=?";

			PreparedStatement pstmt = this.conn.prepareStatement(sql);
			pstmt.setString(1, email);

			ResultSet resultSet = pstmt.executeQuery();
			if (resultSet.next()) {
				String dbPassword = resultSet.getString("password");
				boolean passwordMatches = false;
				boolean needsMigration = false;

				if (dbPassword.startsWith("$2a$") || dbPassword.startsWith("$2b$") || dbPassword.startsWith("$2y$")) {
					try {
						passwordMatches = BCrypt.checkpw(password, dbPassword);
					} catch (IllegalArgumentException e) {
						passwordMatches = password.equals(dbPassword);
						needsMigration = passwordMatches;
					}
				} else {
					passwordMatches = password.equals(dbPassword);
					needsMigration = passwordMatches;
				}

				if (passwordMatches) {
					user = new User();
					user.setId(resultSet.getInt("id"));
					user.setFullName(resultSet.getString("full_name"));
					user.setEmail(resultSet.getString("email"));
					user.setPassword(dbPassword);

					if (needsMigration) {
						String hashed = BCrypt.hashpw(password, BCrypt.gensalt());
						String updateSql = "update user_details set password=? where id=?";
						PreparedStatement updatePstmt = this.conn.prepareStatement(updateSql);
						updatePstmt.setString(1, hashed);
						updatePstmt.setInt(2, user.getId());
						updatePstmt.executeUpdate();
						user.setPassword(hashed);
					}
				}
			}

		} catch (Exception e) {
			e.printStackTrace();
		}

		return user;

	}

	//check old password
	public boolean checkOldPassword(int userId, String oldPassword) {

		boolean f = false;

		try {

			String sql = "select * from user_details where id=?";
			PreparedStatement pstmt = this.conn.prepareStatement(sql);
			pstmt.setInt(1, userId);

			ResultSet resultSet = pstmt.executeQuery();
			if (resultSet.next()) {
				String dbPassword = resultSet.getString("password");
				boolean passwordMatches = false;
				boolean needsMigration = false;

				if (dbPassword.startsWith("$2a$") || dbPassword.startsWith("$2b$") || dbPassword.startsWith("$2y$")) {
					try {
						passwordMatches = BCrypt.checkpw(oldPassword, dbPassword);
					} catch (IllegalArgumentException e) {
						passwordMatches = oldPassword.equals(dbPassword);
						needsMigration = passwordMatches;
					}
				} else {
					passwordMatches = oldPassword.equals(dbPassword);
					needsMigration = passwordMatches;
				}

				if (passwordMatches) {
					f = true;
					if (needsMigration) {
						String hashed = BCrypt.hashpw(oldPassword, BCrypt.gensalt());
						String updateSql = "update user_details set password=? where id=?";
						PreparedStatement updatePstmt = this.conn.prepareStatement(updateSql);
						updatePstmt.setString(1, hashed);
						updatePstmt.setInt(2, userId);
						updatePstmt.executeUpdate();
					}
				}
			}

		} catch (Exception e) {
			e.printStackTrace();
		}

		return f;
	}

	//change password
	public boolean changePassword(int userId, String newPassword) {

		boolean f = false;

		try {

			String hashed = BCrypt.hashpw(newPassword, BCrypt.gensalt());
			String sql = "update user_details set password=? where id=?";
			PreparedStatement pstmt = this.conn.prepareStatement(sql);
			pstmt.setString(1, hashed);
			pstmt.setInt(2, userId);

			pstmt.executeUpdate();

			f = true;

		} catch (Exception e) {
			e.printStackTrace();
		}

		return f;
	}

}
