package com.hms.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

import com.hms.entity.Blog;

public class BlogDAO {
	private Connection conn;

	public BlogDAO(Connection conn) {
		this.conn = conn;
	}

	public List<Blog> getAllBlogs() {
		List<Blog> list = new ArrayList<>();
		Blog b = null;
		try {
			String sql = "SELECT * FROM blog ORDER BY id DESC";
			PreparedStatement ps = conn.prepareStatement(sql);
			ResultSet rs = ps.executeQuery();

			while (rs.next()) {
				b = new Blog();
				b.setId(rs.getInt("id"));
				b.setTitle(rs.getString("title"));
				b.setExcerpt(rs.getString("excerpt"));
				b.setContent(rs.getString("content"));
				b.setAuthor(rs.getString("author"));
				b.setCategory(rs.getString("category"));
				b.setImagePath(rs.getString("imagePath"));
				b.setCommentCount(rs.getInt("commentCount"));
				b.setCreatedAt(rs.getTimestamp("createdAt"));
				list.add(b);
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return list;
	}

	public Blog getBlogById(int id) {
		Blog b = null;
		try {
			String sql = "SELECT * FROM blog WHERE id=?";
			PreparedStatement ps = conn.prepareStatement(sql);
			ps.setInt(1, id);
			ResultSet rs = ps.executeQuery();

			if (rs.next()) {
				b = new Blog();
				b.setId(rs.getInt("id"));
				b.setTitle(rs.getString("title"));
				b.setExcerpt(rs.getString("excerpt"));
				b.setContent(rs.getString("content"));
				b.setAuthor(rs.getString("author"));
				b.setCategory(rs.getString("category"));
				b.setImagePath(rs.getString("imagePath"));
				b.setCommentCount(rs.getInt("commentCount"));
				b.setCreatedAt(rs.getTimestamp("createdAt"));
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return b;
	}

	public boolean addBlog(Blog b) {
		boolean f = false;
		try {
			String sql = "INSERT INTO blog(title, excerpt, content, author, category, imagePath, commentCount) VALUES(?,?,?,?,?,?,?)";
			PreparedStatement ps = conn.prepareStatement(sql);
			ps.setString(1, b.getTitle());
			ps.setString(2, b.getExcerpt());
			ps.setString(3, b.getContent());
			ps.setString(4, b.getAuthor());
			ps.setString(5, b.getCategory());
			ps.setString(6, b.getImagePath());
			ps.setInt(7, b.getCommentCount());

			int i = ps.executeUpdate();
			if (i == 1) {
				f = true;
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return f;
	}

	public boolean deleteBlog(int id) {
		boolean f = false;
		try {
			String sql = "DELETE FROM blog WHERE id=?";
			PreparedStatement ps = conn.prepareStatement(sql);
			ps.setInt(1, id);
			int i = ps.executeUpdate();
			if (i == 1) {
				f = true;
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return f;
	}
}
